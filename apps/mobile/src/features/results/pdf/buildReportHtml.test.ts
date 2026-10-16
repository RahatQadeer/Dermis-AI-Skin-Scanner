import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildReportHtml } from './buildReportHtml';

describe('buildReportHtml', () => {
  it('includes index, concerns, zones, and escaped disclaimer', () => {
    const html = buildReportHtml({
      indexScore: 70,
      concernScores: {
        redness: 74,
        fineLines: 68,
        hydration: 71,
        darkSpots: 65,
        texture: 70,
        pores: 67,
      },
      zoneScores: {
        forehead: 72,
        tZone: 65,
        leftCheek: 78,
        rightCheek: 76,
        periorbital: 70,
        chin: 68,
      },
      concernLabels: {
        redness: 'Redness',
        fineLines: 'Fine lines',
        hydration: 'Hydration',
        darkSpots: 'Dark spots',
        texture: 'Texture',
        pores: 'Pores',
      },
      zoneLabels: {
        forehead: 'Forehead',
        tZone: 'T-zone',
        leftCheek: 'Left cheek',
        rightCheek: 'Right cheek',
        periorbital: 'Periorbital',
        chin: 'Chin',
      },
      title: 'Dermis report',
      indexTitle: 'Index',
      concernsTitle: 'Concerns',
      zonesTitle: 'Zones',
      disclaimer: 'Not medical <advice>',
      generatedLabel: 'Generated 2026-10-05',
    });

    assert.match(html, /70/);
    assert.match(html, /Redness/);
    assert.match(html, /Forehead/);
    assert.match(html, /Not medical &lt;advice&gt;/);
    assert.doesNotMatch(html, /Not medical <advice>/);
  });
});
