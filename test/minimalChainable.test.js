const fs = require('fs');
const MinimalChainable = require('../src/index.js');

jest.mock('fs');

describe('MinimalChainable', () => {
    describe('run', () => {
        it('should replace context variables in prompts', async () => {
            const context = { var1: 'value1', var2: 'value2' };
            const model = {};
            const callable = jest.fn().mockResolvedValue('output1');

            const prompts = [
                'Prompt with {{var1}} and {{var2}}',
                'Next prompt with {{output[-1]}}',
            ];

            const [output, contextFilledPrompts] = await MinimalChainable.run(context, model, callable, prompts);

            expect(contextFilledPrompts).toEqual([
                'Prompt with value1 and value2',
                'Next prompt with "output1"',
            ]);

            expect(output).toEqual(['output1', 'output1']);
        });

        it('should replace output references in prompts', async () => {
            const context = {};
            const model = {};
            const callable = jest.fn()
                .mockResolvedValueOnce({ key: 'value1' })
                .mockResolvedValueOnce('output2');

            const prompts = [
                'Prompt1',
                'Next prompt with {{output[-1].key}}',
            ];

            const [output, contextFilledPrompts] = await MinimalChainable.run(context, model, callable, prompts);

            expect(contextFilledPrompts).toEqual([
                'Prompt1',
                'Next prompt with value1',
            ]);

            expect(output).toEqual([{ key: 'value1' }, 'output2']);
        });

        it('should handle callable errors', async () => {
            const context = {};
            const model = {};
            const callable = jest.fn().mockRejectedValue(new Error('Callable error'));

            const prompts = ['Prompt1'];

            await expect(MinimalChainable.run(context, model, callable, prompts)).rejects.toThrow('Callable error');
        });

        it('should replace context variables and output references across multiple levels', async () => {
            const context = { var1: 'value1', var2: 'value2' };
            const model = {};
            const callable = jest.fn()
                .mockResolvedValueOnce('output1')
                .mockResolvedValueOnce({ key: 'value2' })
                .mockResolvedValueOnce('output3')
                .mockResolvedValueOnce({ key: 'value4' })

            const prompts = [
                'Prompt with {{var1}} and {{var2}}',
                'Next prompt with {{output[-1]}}',
                'Third prompt with {{output[-1].key}}',
                'Fourth prompt with {{output[-1]}} and {{output[-2].key}}',
                '{{output[-3].key}}'
            ];

            const [output, contextFilledPrompts] = await MinimalChainable.run(context, model, callable, prompts);

            expect(contextFilledPrompts).toEqual([
                'Prompt with value1 and value2',
                'Next prompt with "output1"',
                'Third prompt with value2',
                'Fourth prompt with "output3" and value2',
                'value2'
            ]);

            expect(output).toEqual([
                'output1',
                { key: 'value2' },
                'output3',
                { key: 'value4' },
            ]);
        });
    });

    describe('toDelimTextFile', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should write content to a delimited text file', async () => {
            const content = [
                'First result',
                { key: 'value' },
            ];

            const resultString = await MinimalChainable.toDelimTextFile('testfile', content);

            expect(fs.writeFileSync).toHaveBeenCalledWith('testfile.txt', '🔗 -------- Prompt Chain Result #1 -------------\n\nFirst result\n\n', { flag: 'a' });
            expect(fs.writeFileSync).toHaveBeenCalledWith('testfile.txt', '🔗🔗 -------- Prompt Chain Result #2 -------------\n\n{"key":"value"}\n\n', { flag: 'a' });

            expect(resultString).toBe(
                '🔗 -------- Prompt Chain Result #1 -------------\n\nFirst result\n\n' +
                '🔗🔗 -------- Prompt Chain Result #2 -------------\n\n{"key":"value"}\n\n'
            );
        });

        it('should handle empty content array', async () => {
            const content = [];

            const resultString = await MinimalChainable.toDelimTextFile('testfile', content);

            expect(fs.writeFileSync).not.toHaveBeenCalled();
            expect(resultString).toBe('');
        });
    });
});
