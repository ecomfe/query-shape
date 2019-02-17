const {createStrategy, keepEarliestSuccess, findQuery} = require('../index');
const {passCommonTests, prepareQuerySet, prepareErroredQuerySet, TEST_DATA, TEST_KEY} = require('./base');

const TEST_KEEP_EARLIEST_SUCCESS = {value: 'keepEarliestSuccess'};

const strategy = createStrategy(keepEarliestSuccess);

describe('keepEarliestSuccess', () => {
    passCommonTests(strategy);

    test('will never override previous success response on success', () => {
        const prepared = prepareQuerySet(strategy);
        const received = strategy.receive(prepared, TEST_KEY, TEST_KEEP_EARLIEST_SUCCESS);
        const {response, nextResponse} = findQuery(received, TEST_KEY);
        expect(response.data).toBe(TEST_DATA);
        expect(response.error).toBeUndefined();
        expect(nextResponse).toBeNull();
    });

    test('will override previous error response on success', () => {
        const prepared = prepareErroredQuerySet(strategy);
        const received = strategy.receive(prepared, TEST_KEY, TEST_KEEP_EARLIEST_SUCCESS);
        const {response, nextResponse} = findQuery(received, TEST_KEY);
        expect(response.data).toBe(TEST_KEEP_EARLIEST_SUCCESS);
        expect(response.error).toBeUndefined();
        expect(nextResponse).toBeNull();
    });

    test('will never override previous success response on error', () => {
        const prepared = prepareQuerySet(strategy);
        const errored = strategy.error(prepared, TEST_KEY, TEST_KEEP_EARLIEST_SUCCESS);
        const {response, nextResponse} = findQuery(errored, TEST_KEY);
        expect(response.data).toBe(TEST_DATA);
        expect(response.error).toBeUndefined();
        expect(nextResponse).toBeNull();
    });

    test('will override previous error response on error', () => {
        const prepared = prepareErroredQuerySet(strategy);
        const errored = strategy.error(prepared, TEST_KEY, TEST_KEEP_EARLIEST_SUCCESS);
        const {response, nextResponse} = findQuery(errored, TEST_KEY);
        expect(response.data).toBeUndefined();
        expect(response.error).toBe(TEST_KEEP_EARLIEST_SUCCESS);
        expect(nextResponse).toBeNull();
    });
});
