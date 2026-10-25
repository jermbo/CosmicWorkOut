// Feedback vocabulary: which tap gives which feedback, hold-to-repeat timing,
// and reading a hard shadow's offset for the press animation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	FEEDBACK_KINDS,
	TONES,
	VIBRATION,
	feedbackFor,
	repeatDelay,
	shadowOffset,
} from './feedback/patterns.ts';
import { handoffScrollTop, plateKeyframes } from './feedback/plate.ts';

test('every feedback kind has a vibration and a tone', () => {
	for (const kind of FEEDBACK_KINDS) {
		assert.ok(VIBRATION[kind].length > 0, kind);
		assert.ok(TONES[kind].length > 0, kind);
	}
});

test('feedbackFor: explicit data-feedback wins, and none silences', () => {
	assert.equal(feedbackFor({ feedback: 'success' }), 'success');
	assert.equal(feedbackFor({ feedback: 'none', role: 'tab' }), null);
	assert.equal(feedbackFor({ feedback: 'bogus' }), 'tap');
});

test('feedbackFor: choosing one of several is select, anything else is tap', () => {
	assert.equal(feedbackFor({ role: 'radio' }), 'select');
	assert.equal(feedbackFor({ role: 'tab' }), 'select');
	assert.equal(feedbackFor({ ariaPressed: 'false' }), 'select');
	assert.equal(feedbackFor({ inNav: true }), 'select');
	assert.equal(feedbackFor({ isCheckable: true }), 'select');
	assert.equal(feedbackFor({}), 'tap');
	assert.equal(feedbackFor({ role: 'button' }), 'tap');
});

test('repeatDelay waits first, then speeds up to a floor', () => {
	assert.equal(repeatDelay(0), 420);
	assert.equal(repeatDelay(1), 180);
	assert.ok(repeatDelay(2) < repeatDelay(1));
	assert.equal(repeatDelay(50), 45);
});

test('shadowOffset reads computed box-shadow offsets', () => {
	assert.deepEqual(shadowOffset('rgb(242, 240, 234) 6px 6px 0px 0px'), { x: 6, y: 6 });
	assert.deepEqual(shadowOffset('rgb(78, 189, 247) 4px 4px 0px 0px'), { x: 4, y: 4 });
	assert.equal(shadowOffset('none'), null);
	assert.equal(shadowOffset('rgba(0, 0, 0, 0) 0px 0px 0px 0px'), null);
	assert.equal(shadowOffset(''), null);
});

test('plateKeyframes lifts, spans both cards, then sets down on the next', () => {
	const shadow = { rest: 'R', lifted: 'L' };
	const kf = plateKeyframes({ top: 16, height: 120 }, { top: 150, height: 100 }, shadow);
	assert.equal(kf.length, 5);
	assert.deepEqual([kf[0].top, kf[0].height, kf[0].boxShadow], ['16px', '120px', 'R']);
	assert.equal(kf[1].translate, '-4px -4px');
	assert.deepEqual([kf[2].top, kf[2].height], ['16px', '234px']);
	assert.deepEqual([kf[3].top, kf[3].height], ['150px', '100px']);
	assert.deepEqual([kf[4].top, kf[4].translate, kf[4].boxShadow], ['150px', '0 0', 'R']);
});

test('plateKeyframes spans upward when the live exercise moves back', () => {
	const kf = plateKeyframes(
		{ top: 150, height: 100 },
		{ top: 16, height: 120 },
		{ rest: '', lifted: '' },
	);
	assert.deepEqual([kf[2].top, kf[2].height], ['16px', '234px']);
	assert.equal(kf[4].top, '16px');
});

test('handoffScrollTop leaves the list alone when both cards are on screen', () => {
	const view = { scrollTop: 0, height: 600 };
	assert.equal(handoffScrollTop({ top: 16, height: 190 }, { top: 220, height: 190 }, view), null);
});

test('handoffScrollTop scrolls down to show both cards when they fit together', () => {
	const view = { scrollTop: 0, height: 500 };
	// span 16-24 = -8 … 600+24 = 624 → too tall (632 > 500); next card 410-24 … 600+24 → 214 tall
	assert.equal(handoffScrollTop({ top: 16, height: 190 }, { top: 410, height: 190 }, view), 124);
	// both fit: span -8 … 434 (442 ≤ 500); bottom 434 > 400 → scroll to 434 - 400 = 34
	assert.equal(
		handoffScrollTop(
			{ top: 16, height: 190 },
			{ top: 220, height: 190 },
			{ scrollTop: 0, height: 450 - 50 },
		),
		34,
	);
	assert.equal(
		handoffScrollTop(
			{ top: 16, height: 190 },
			{ top: 220, height: 190 },
			{ scrollTop: 0, height: 450 },
		),
		null,
	);
	assert.equal(
		handoffScrollTop(
			{ top: 216, height: 190 },
			{ top: 420, height: 190 },
			{ scrollTop: 0, height: 450 },
		),
		184,
	);
});

test('handoffScrollTop scrolls up when the live exercise moves back above', () => {
	const view = { scrollTop: 500, height: 450 };
	assert.equal(handoffScrollTop({ top: 620, height: 190 }, { top: 416, height: 190 }, view), 392);
});

test('handoffScrollTop shows the top of a next card taller than the screen', () => {
	const view = { scrollTop: 0, height: 300 };
	assert.equal(handoffScrollTop({ top: 16, height: 190 }, { top: 220, height: 400 }, view), 196);
});
