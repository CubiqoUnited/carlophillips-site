import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';
import inventorySchema from '../contracts/shopify-app-inventory.schema.json';
import inventory from '../evidence/shopify/po-observed-installed-apps-2026-07-22.json';

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(inventorySchema);

describe('Product Owner-observed Shopify app inventory', () => {
  it('validates exactly 30 unique reported installed-app records', () => {
    expect(validate(inventory), JSON.stringify(validate.errors)).toBe(true);
    expect(inventory.apps).toHaveLength(30);
    expect(new Set(inventory.apps.map((app) => app.name)).size).toBe(30);
  });

  it('does not turn reported installation into callable capability', () => {
    expect(inventory.observation).toMatchObject({
      source: 'product-owner-observed',
      installedStatus: 'reported-installed',
      capabilityStatus: 'unverified',
      browserAudit: 'login-required',
    });
    expect(
      inventory.apps.every(
        (app) => app.verifiedCallableSurface === 'none-auth-blocked'
      )
    ).toBe(true);
  });

  it('keeps native Shopify access distinct from third-party private access', () => {
    const byName = Object.fromEntries(
      inventory.apps.map((app) => [app.name, app])
    );
    expect(byName.Flow.accessPathToVerify).toBe(
      'shopify-native-admin-flow-api'
    );
    expect(byName['Apliiq - Print On Demand'].accessPathToVerify).toBe(
      'third-party-private-api-webhook-or-browser'
    );
    expect(byName['Shopify CLI Connector App'].accessPathToVerify).toBe(
      'development-cli-oauth-scopes'
    );
  });

  it('leaves custom connector authorization unproven with exact safe next actions', () => {
    const connectorNames = [
      'CodexAutomation5',
      'Shopify CLI Connector App',
      'Carlophillips Headless',
    ];
    for (const name of connectorNames) {
      const app = inventory.apps.find((candidate) => candidate.name === name);
      expect(app.ownershipFinding).toMatch(/does not|neither/i);
      expect(app.safeNextAction).toMatch(/read-only|Inspect/i);
      expect(app.verifiedCallableSurface).toBe('none-auth-blocked');
    }
  });

  it('flags every explicitly reported usage-fee app', () => {
    const feeApps = inventory.apps
      .filter((app) => app.usageFeeRisk === 'reported-usage-fees')
      .map((app) => app.name)
      .sort();
    expect(feeApps).toEqual([
      'Order Printer Pro',
      'Tidio - Live Chat & Chatbots',
    ]);
  });
});
