const {createStrategy, waitAccept, findQuery} = require('../index');
const {passCommonTests, prepareQuerySet, TEST_DATA, TEST_KEY} = require('./base');

const ACCEPT_TEST_DATA = {value: 'waitAccept'};

const strategy = createStrategy(waitAccept);

describe('waitAccept', () => {
    passCommonTests(strategy);

    test('will never auto accept success responses', () => {
        const prepared = prepareQuerySet(strategy);
        const received = strategy.receive(prepared, TEST_KEY, ACCEPT_TEST_DATA);
        const {response, nextResponse} = findQuery(received, TEST_KEY);
        expect(response.data).toBe(TEST_DATA);
        expect(nextResponse.data).toBe(ACCEPT_TEST_DATA);
        expect(nextResponse.error).toBeUndefined();
    });

    test('will never auto accept error responses', () => {
        const prepared = prepareQuerySet(strategy);
        const errored = strategy.error(prepared, TEST_KEY, ACCEPT_TEST_DATA);
        const {response, nextResponse} = findQuery(errored, TEST_KEY);
        expect(response.data).toBe(TEST_DATA);
        expect(nextResponse.error).toBe(ACCEPT_TEST_DATA);
        expect(nextResponse.data).toBeUndefined();
    });

    test('will accept nextResponse when accept is called', () => {
        const prepared = prepareQuerySet(strategy);
        const received = strategy.receive(prepared, TEST_KEY, ACCEPT_TEST_DATA);
        const accepted = strategy.accept(received, TEST_KEY);
        const {response, nextResponse} = findQuery(accepted, TEST_KEY);
        expect(response.data).toBe(ACCEPT_TEST_DATA);
        expect(response.error).toBeUndefined();
        expect(nextResponse).toBeNull();
    });
});
