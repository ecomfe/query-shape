const {createStrategy, acceptLatest, findQuery} = require('../index');
const {passCommonTests, prepareQuerySet, TEST_KEY} = require('./base');

const TEST_DATA = {value: 'acceptLatest'};

const strategy = createStrategy(acceptLatest);

describe('acceptLatest', () => {
    passCommonTests(strategy);

    test('will immediately accept later success responses', () => {
        const prepared = prepareQuerySet(strategy);
        const received = strategy.receive(prepared, TEST_KEY, TEST_DATA);
        const {response, nextResponse} = findQuery(received, TEST_KEY);
        expect(response.data).toBe(TEST_DATA);
        expect(response.error).toBeUndefined();
        expect(nextResponse).toBeNull();
    });

    test('will immediately accept later error responses', () => {
        const prepared = prepareQuerySet(strategy);
        const errored = strategy.error(prepared, TEST_KEY, TEST_DATA);
        const {response, nextResponse} = findQuery(errored, TEST_KEY);
        expect(response.error).toBe(TEST_DATA);
        expect(response.data).toBeUndefined();
        expect(nextResponse).toBeNull();
    });
});
