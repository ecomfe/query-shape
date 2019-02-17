const {createStrategy, keepEarliest, findQuery} = require('../index');
const {passCommonTests, prepareQuerySet, TEST_DATA, TEST_KEY} = require('./base');

const TEST_KEEP_EARLIEST = {value: 'keepEarliest'};

const strategy = createStrategy(keepEarliest);

describe('keepEarliest', () => {
    passCommonTests(strategy);

    test('will never override previous response on success', () => {
        const prepared = prepareQuerySet(strategy);
        const received = strategy.receive(prepared, TEST_KEY, TEST_KEEP_EARLIEST);
        const {response, nextResponse} = findQuery(received, TEST_KEY);
        expect(response.data).toBe(TEST_DATA);
        expect(response.error).toBeUndefined();
        expect(nextResponse).toBeNull();
    });

    test('will never override previous response on error', () => {
        const prepared = prepareQuerySet(strategy);
        const errored = strategy.error(prepared, TEST_KEY, TEST_KEEP_EARLIEST);
        const {response, nextResponse} = findQuery(errored, TEST_KEY);
        expect(response.data).toBe(TEST_DATA);
        expect(response.error).toBeUndefined();
        expect(nextResponse).toBeNull();
    });
});
