const {findQuery, createStrategy} = require('../index');

const TEST_KEY = {x: 1};

const mockStrategyOptions = {
    shouldAcceptIncomingResponse() {
        return true;
    },
    shouldUseIncomingResponse() {
        return true;
    },
};

const strategy = createStrategy(mockStrategyOptions);

describe('findQuery', () => {
    test('will find query with given key', () => {
        const empty = strategy.initialize();
        const fetched = strategy.fetch(empty, TEST_KEY);
        const query = findQuery(fetched, TEST_KEY);
        expect(query).toBeDefined();
    });

    test('will get undefined when find with non-exist key', () => {
        const empty = strategy.initialize();
        const query = findQuery(empty, TEST_KEY);
        expect(query).toBeUndefined();
    });
});
