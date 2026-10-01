import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Option } from 'effect';

import * as Stepper from '../src/lib/stepper.ts';

describe('stepper model', () => {
  it('tracks the seen pair across clicks and reports the step as an OutMessage', () => {
    const model = Stepper.init({ id: 'checkout', activeStep: 1 });
    const result = Stepper.update(model, Stepper.Message.ClickedStep({ step: 3 }));
    assert.equal(result.model.seenStep, 3);
    assert.equal(result.model.previousSeenStep, 1);
    assert.equal(result.outMessage?._tag, 'ClickedStep');
  });

  it('reflects programmatic activeStep changes into the seen pair', () => {
    const model = Stepper.init({ id: 'checkout', activeStep: 0 });
    const moved = Stepper.reflectActiveStep(model, 4);
    assert.equal(moved.previousSeenStep, 0);
    assert.equal(moved.seenStep, 4);
    assert.equal(Stepper.reflectActiveStep(moved, 4), moved);
  });

  it('derives the previous active step from the seen pair like astryx', () => {
    const model = Stepper.init({ id: 'checkout', activeStep: 2 });
    assert.equal(Stepper.previousActiveStep(model, 2), 2);
    const result = Stepper.update(model, Stepper.Message.ClickedStep({ step: 0 }));
    assert.equal(Stepper.previousActiveStep(result.model, 0), 2);
    // Parent hasn't moved activeStep yet: seen pair still says the last seen.
    assert.equal(Stepper.previousActiveStep(result.model, 2), 0);
  });

  it('collapses a horizontal stepper only when the measured width is below the per-step minimum', () => {
    const model = Stepper.init({ id: 'checkout', activeStep: 0 });
    assert.equal(Stepper.isCompact(model, 4, 112), false);
    const measured = Stepper.update(
      model,
      Stepper.Message.ObservedStepperRoot({ width: 336 }),
    ).model;
    assert.equal(Stepper.isCompact(measured, 4, 112), true);
    assert.equal(Stepper.isCompact(measured, 3, 112), false);
    assert.equal(Stepper.isCompact(measured, 0, 112), false);
  });
});

describe('stepper choreography', () => {
  it('maps step progress', () => {
    assert.equal(Stepper.progressFor(0, 2), 'completed');
    assert.equal(Stepper.progressFor(2, 2), 'in-progress');
    assert.equal(Stepper.progressFor(3, 2), 'not-started');
  });

  it('animates only the arriving span on a single-step advance', () => {
    assert.deepEqual(Stepper.fillTiming(false, 2, 0, 0, 1), {
      duration: '0ms',
      delay: '0ms',
    });
    assert.deepEqual(Stepper.fillTiming(true, 2, 0, 0, 1), {
      duration: '0ms',
      delay: '0ms',
    });
    assert.deepEqual(
      Stepper.fillTiming(true, 2, 2, Stepper.OT_ARRIVAL_SHARE_HORIZONTAL, 1),
      { duration: '300ms', delay: '150ms' },
    );
  });

  it('names steps accessibly', () => {
    assert.equal(Stepper.stepAriaLabel(0, 'Billing', null), 'Go to step 1, Billing');
    assert.equal(
      Stepper.stepAriaLabel(2, 'Payment', 'Error'),
      'Go to step 3, Payment, Error',
    );
    assert.equal(Stepper.stepStatusText('success', 'in-progress'), 'Completed');
    assert.equal(Stepper.stepStatusText('error', 'completed'), 'Error');
    assert.equal(Stepper.stepStatusText(undefined, 'completed'), 'Completed');
    assert.equal(Stepper.stepStatusText(undefined, 'in-progress'), null);
  });
});
