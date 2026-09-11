const { randomUUID } = require('crypto');
const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

const registry = new Map();

const associationMap = {
  farmerId: 'User',
  userId: 'User',
  centreId: 'ProcurementCentre',
  cropId: 'Crop',
  slotId: 'Slot',
  bookingId: 'Booking',
  procurementId: 'Procurement',
  paymentId: 'Payment',
  officerId: 'User',
  farmerIdNumber: 'User',
  officerIds: 'User',
  availableCrops: 'Crop',
};

const idValue = (value) => (value && value._id ? value._id : value);
const valuesEqual = (left, right) => String(idValue(left)) === String(idValue(right));

function getPath(document, path) {
  return path.split('.').reduce((value, key) => (value == null ? undefined : value[key]), document);
}

function setPath(document, path, value) {
  const parts = path.split('.');
  const last = parts.pop();
  const target = parts.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') current[key] = {};
    return current[key];
  }, document);
  target[last] = value;
}

function matchesValue(value, expected) {
  if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
    return Object.entries(expected).every(([operator, operand]) => {
      if (operator === '$ne') return !valuesEqual(value, operand);
      if (operator === '$in') return operand.some((item) => Array.isArray(value) ? value.some((entry) => valuesEqual(entry, item)) : valuesEqual(value, item));
      if (operator === '$nin') return !operand.some((item) => valuesEqual(value, item));
      if (operator === '$gte') return value >= operand;
      if (operator === '$gt') return value > operand;
      if (operator === '$lte') return value <= operand;
      if (operator === '$lt') return value < operand;
      if (operator === '$exists') return operand ? value !== undefined : value === undefined;
      if (operator === '$elemMatch') return Array.isArray(value) && value.some((item) => matches(item, operand));
      return valuesEqual(value, expected);
    });
  }
  if (Array.isArray(value)) return value.some((item) => valuesEqual(item, expected));
  return valuesEqual(value, expected);
}

function matches(document, filter = {}) {
  return Object.entries(filter).every(([path, expected]) => {
    if (path === '$or') return expected.some((item) => matches(document, item));
    if (path === '$and') return expected.every((item) => matches(document, item));
    return matchesValue(getPath(document, path), expected);
  });
}

function applyUpdate(document, update = {}) {
  const operators = Object.keys(update).some((key) => key.startsWith('$'));
  if (!operators) return Object.assign(document, update);
  for (const [path, value] of Object.entries(update.$set || {})) setPath(document, path, value);
  for (const [path, value] of Object.entries(update.$inc || {})) setPath(document, path, (getPath(document, path) || 0) + value);
  for (const [path, value] of Object.entries(update.$push || {})) {
    const current = getPath(document, path) || [];
    current.push(value);
    setPath(document, path, current);
  }
  for (const [path, value] of Object.entries(update.$addToSet || {})) {
    const current = getPath(document, path) || [];
    const additions = value && value.$each ? value.$each : [value];
    additions.forEach((item) => { if (!current.some((entry) => valuesEqual(entry, item))) current.push(item); });
    setPath(document, path, current);
  }
  for (const path of update.$unset ? Object.keys(update.$unset) : []) delete document[path];
  return document;
}

class Document {
  constructor(model, data) {
    this._model = model;
    Object.assign(this, data);
  }

  async save() {
    this.updatedAt = new Date().toISOString();
    await this._model._write(this);
    return this;
  }

  toObject() {
    const copyValue = (value, seen = new WeakSet()) => {
      if (value instanceof Date) return value.toISOString();
      if (value === null || typeof value !== 'object') return typeof value === 'function' ? undefined : value;
      if (seen.has(value)) return undefined;
      seen.add(value);
      if (Array.isArray(value)) return value.map((item) => copyValue(item, seen));
      return Object.fromEntries(
        Object.entries(value)
          .filter(([key, item]) => key !== '_model' && typeof item !== 'function')
          .map(([key, item]) => [key, copyValue(item, seen)])
      );
    };
    return copyValue(this);
  }

  toJSON() {
    const copy = this.toObject();
    if (this._model.name === 'User') delete copy.password;
    if (this._model.name === 'Slot') copy.available = copy.capacity - copy.booked;
    return copy;
  }
}

class Query {
  constructor(model, operation) {
    this.model = model;
    this.operation = operation;
    this.transforms = [];
  }

  populate(path) { this.transforms.push({ type: 'populate', path }); return this; }
  sort(spec) { this.transforms.push({ type: 'sort', spec }); return this; }
  skip(value) { this.transforms.push({ type: 'skip', value: Number(value) }); return this; }
  limit(value) { this.transforms.push({ type: 'limit', value: Number(value) }); return this; }
  select(fields) { this.transforms.push({ type: 'select', fields }); return this; }
  session() { return this; }

  async execute() {
    let result = await this.operation();
    const many = Array.isArray(result);
    let documents = many ? result : [result];
    for (const transform of this.transforms) {
      if (transform.type === 'sort') {
        const entries = Object.entries(transform.spec);
        documents.sort((left, right) => {
          for (const [path, direction] of entries) {
            const a = getPath(left, path); const b = getPath(right, path);
            if (a === b) continue;
            return (a > b ? 1 : -1) * direction;
          }
          return 0;
        });
      } else if (transform.type === 'skip') documents = documents.slice(transform.value);
      else if (transform.type === 'limit') documents = documents.slice(0, transform.value);
      else if (transform.type === 'select') {
        const fields = transform.fields.split(/\s+/).filter(Boolean);
        const exclude = fields.filter((field) => field.startsWith('-')).map((field) => field.slice(1));
        if (exclude.length) documents.forEach((item) => exclude.forEach((field) => delete item[field]));
      } else if (transform.type === 'populate') {
        await Promise.all(documents.map((item) => this.model._populate(item, transform.path)));
      }
    }
    return many ? documents : documents[0] || null;
  }

  then(resolve, reject) { return this.execute().then(resolve, reject); }
  catch(reject) { return this.execute().catch(reject); }
}

class PostgresModel {
  constructor(name, defaults = {}, methods = {}) { this.name = name; this.defaults = defaults; this.methods = methods; registry.set(name, this); }

  _document(data) {
    if (data instanceof Document) return data;
    const document = new Document(this, data);
    Object.entries(this.methods).forEach(([name, method]) => { document[name] = method.bind(document); });
    return document;
  }

  async _all() {
    const { rows } = await pool.query('SELECT data FROM documents WHERE collection = $1', [this.name]);
    return rows.map((row) => this._document(row.data));
  }

  async _write(document) {
    await pool.query(
      `INSERT INTO documents (id, collection, data, created_at, updated_at)
       VALUES ($1, $2, $3::jsonb, $4, $5)
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at`,
      [document._id, this.name, JSON.stringify(document.toObject()), document.createdAt, document.updatedAt]
    );
  }

  _query(filter = {}, many = false) {
    return new Query(this, async () => {
      const found = (await this._all()).filter((item) => matches(item, filter));
      return many ? found : found[0] || null;
    });
  }

  find(filter) { return this._query(filter, true); }
  findOne(filter) { return this._query(filter, false); }
  findById(id) { return this._query({ _id: id }, false); }
  countDocuments(filter = {}) { return this._all().then((items) => items.filter((item) => matches(item, filter)).length); }
  create(data) {
    if (Array.isArray(data)) return Promise.all(data.map((item) => this.create(item)));
    const now = new Date().toISOString();
    const document = this._document({ ...this.defaults, ...data, _id: data._id || randomUUID(), createdAt: data.createdAt || now, updatedAt: now });
    if (this.name === 'User' && document.password && !document.password.startsWith('$2')) {
      return bcrypt.hash(document.password, 12).then((password) => { document.password = password; return document.save(); });
    }
    return document.save();
  }
  insertMany(data) { return this.create(data); }
  async deleteMany(filter = {}) {
    const items = (await this._all()).filter((item) => matches(item, filter));
    if (items.length) await pool.query('DELETE FROM documents WHERE collection = $1 AND id = ANY($2)', [this.name, items.map((item) => item._id)]);
    return { deletedCount: items.length };
  }
  async _update(filter, update, options = {}) {
    const document = (await this._all()).find((item) => matches(item, filter));
    if (!document) return null;
    applyUpdate(document, update);
    await document.save();
    return document;
  }
  findByIdAndUpdate(id, update, options) { return new Query(this, () => this._update({ _id: id }, update, options)); }
  findOneAndUpdate(filter, update, options) { return new Query(this, () => this._update(filter, update, options)); }
  async findByIdAndDelete(id) { const item = await this.findById(id); if (item) await this.deleteMany({ _id: id }); return item; }

  async _populate(document, path) {
    if (!document) return document;
    const modelName = associationMap[path] || associationMap[path.replace(/s$/, '')];
    if (!modelName) return document;
    const target = registry.get(modelName);
    if (!target) return document;
    const value = getPath(document, path);
    const values = Array.isArray(value) ? value : [value];
    const populated = await Promise.all(values.filter(Boolean).map((id) => target.findById(id)));
    setPath(document, path, Array.isArray(value) ? populated.filter(Boolean) : populated[0] || value);
    return document;
  }

  async aggregate(pipeline) {
    let rows = await this._all();
    for (const stage of pipeline) {
      if (stage.$match) rows = rows.filter((row) => matches(row, stage.$match));
      if (stage.$unwind) rows = rows.flatMap((row) => {
        const path = stage.$unwind.replace('$', ''); const value = getPath(row, path);
        return Array.isArray(value) ? value.map((item) => { const copy = JSON.parse(JSON.stringify(row)); setPath(copy, path, item); return copy; }) : [row];
      });
      if (stage.$sort) rows.sort((a, b) => Object.entries(stage.$sort).reduce((result, [path, dir]) => result || ((getPath(a, path) > getPath(b, path) ? 1 : -1) * dir), 0));
      if (stage.$limit) rows = rows.slice(0, stage.$limit);
      if (stage.$project) rows = rows.map((row) => Object.fromEntries(Object.entries(stage.$project).filter(([, include]) => include).map(([key, expression]) => [key, expression === 1 ? getPath(row, key) : getPath(row, String(expression).replace('$', ''))])));
    }
    return rows;
  }
}

module.exports = { PostgresModel, registry };
