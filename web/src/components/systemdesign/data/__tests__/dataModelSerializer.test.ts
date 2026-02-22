import { describe, it, expect } from 'vitest';
import { serializeDataModelToText } from '../dataModelSerializer';
import type { DbChoice } from '../../../../types';

// ── Tests ──

describe('serializeDataModelToText', () => {
  // ── Schema handling ──

  describe('schema handling', () => {
    it('renders schema content as-is', () => {
      const schema = 'CREATE TABLE users (\n  id UUID PRIMARY KEY\n);';
      const result = serializeDataModelToText(schema, 'sql', 'ACID needed');
      expect(result).toContain('Schema:\nCREATE TABLE users (\n  id UUID PRIMARY KEY\n);');
    });

    it('shows placeholder for empty schema', () => {
      const result = serializeDataModelToText('', 'sql', 'reason');
      expect(result).toContain('Schema:\n(none defined)');
    });

    it('shows placeholder for whitespace-only schema', () => {
      const result = serializeDataModelToText('   \n  \n ', 'sql', 'reason');
      expect(result).toContain('Schema:\n(none defined)');
    });

    it('trims leading/trailing whitespace from schema', () => {
      const result = serializeDataModelToText('  CREATE TABLE t();  ', 'sql', 'reason');
      expect(result).toContain('Schema:\nCREATE TABLE t();');
    });
  });

  // ── Database choice labels ──

  describe('database choice labels', () => {
    it('maps "sql" to "SQL (Relational)"', () => {
      const result = serializeDataModelToText('schema', 'sql', 'reason');
      expect(result).toContain('Database Choice: SQL (Relational)');
    });

    it('maps "nosql" to "NoSQL (Document/KV)"', () => {
      const result = serializeDataModelToText('schema', 'nosql', 'reason');
      expect(result).toContain('Database Choice: NoSQL (Document/KV)');
    });

    it('maps "both" to "Polyglot Persistence"', () => {
      const result = serializeDataModelToText('schema', 'both', 'reason');
      expect(result).toContain('Database Choice: Polyglot Persistence');
    });

    it('shows "(not selected)" for empty string choice', () => {
      const result = serializeDataModelToText('schema', '' as DbChoice, 'reason');
      expect(result).toContain('Database Choice: (not selected)');
    });
  });

  // ── Justification handling ──

  describe('justification handling', () => {
    it('renders justification text', () => {
      const result = serializeDataModelToText('schema', 'sql', 'Need strong consistency');
      expect(result).toContain('Justification: Need strong consistency');
    });

    it('shows "(none)" for empty justification', () => {
      const result = serializeDataModelToText('schema', 'sql', '');
      expect(result).toContain('Justification: (none)');
    });

    it('shows "(none)" for whitespace-only justification', () => {
      const result = serializeDataModelToText('schema', 'sql', '   ');
      expect(result).toContain('Justification: (none)');
    });

    it('trims justification whitespace', () => {
      const result = serializeDataModelToText('schema', 'sql', '  ACID needed  ');
      expect(result).toContain('Justification: ACID needed');
    });
  });

  // ── Structure ──

  describe('output structure', () => {
    it('starts with "Data Model:" header', () => {
      const result = serializeDataModelToText('schema', 'sql', 'reason');
      expect(result).toMatch(/^Data Model:/);
    });

    it('has blank line after header', () => {
      const result = serializeDataModelToText('schema', 'sql', 'reason');
      const lines = result.split('\n');
      expect(lines[0]).toBe('Data Model:');
      expect(lines[1]).toBe('');
      expect(lines[2]).toBe('Schema:');
    });

    it('has blank line between schema and database choice', () => {
      const result = serializeDataModelToText('my schema', 'sql', 'reason');
      const lines = result.split('\n');
      const schemaContentIdx = lines.indexOf('my schema');
      expect(lines[schemaContentIdx + 1]).toBe('');
      expect(lines[schemaContentIdx + 2]).toMatch(/^Database Choice:/);
    });

    it('has justification on line after database choice', () => {
      const result = serializeDataModelToText('schema', 'sql', 'reason');
      const lines = result.split('\n');
      const dbIdx = lines.findIndex((l) => l.startsWith('Database Choice:'));
      expect(lines[dbIdx + 1]).toMatch(/^Justification:/);
    });
  });

  // ── Full integration ──

  describe('full integration', () => {
    it('serializes all fields populated', () => {
      const schema = 'CREATE TABLE users (\n  id UUID PRIMARY KEY,\n  username VARCHAR(50) UNIQUE NOT NULL\n);';
      const result = serializeDataModelToText(schema, 'sql', 'Need strong consistency for financial transactions and complex joins.');

      expect(result).toBe(
        'Data Model:\n' +
        '\n' +
        'Schema:\n' +
        'CREATE TABLE users (\n' +
        '  id UUID PRIMARY KEY,\n' +
        '  username VARCHAR(50) UNIQUE NOT NULL\n' +
        ');\n' +
        '\n' +
        'Database Choice: SQL (Relational)\n' +
        'Justification: Need strong consistency for financial transactions and complex joins.',
      );
    });

    it('serializes all fields empty (worst case)', () => {
      const result = serializeDataModelToText('', '' as DbChoice, '');

      expect(result).toBe(
        'Data Model:\n' +
        '\n' +
        'Schema:\n' +
        '(none defined)\n' +
        '\n' +
        'Database Choice: (not selected)\n' +
        'Justification: (none)',
      );
    });
  });
});
