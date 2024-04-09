import path from 'path';
import plugin from '../src/index';
import { writeAndFormat } from './lib/write';

void main();

async function main() {
	const { pluginsToRulesDTS } = await import('eslint-typegen/core');

	// @ts-expect-error - types are a bit strict here
	const ruleTypes = await pluginsToRulesDTS({ svelte: plugin });

	void writeAndFormat(
		path.join(__dirname, '../src/rule-types.d.ts'),
		`
// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "pnpm run update"

${ruleTypes}`
	);
}
