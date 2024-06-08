import type { ITestEndMessage, TestMessage } from '@relia/core';
import { useState } from 'hono/jsx';
import ReportTable from '../components/ReportTable';
import { css, cx } from 'hono/css';
import basicYaml from '../../../../examples/basic.yaml?raw';
import exampleResult from '../reports/example.json';

const tryBtn = css`
	margin-top: 1rem;
	margin-bottom: 1rem;
`;

export default function CreateForm() {
	const [yamlPlan, setYamlPlan] = useState('');
	const [messages, setMessages] = useState<ITestEndMessage[] | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async () => {
		if (submitting) {
			return;
		}
		try {
			setSubmitting(true);
			if (yamlPlan.trim() === basicYaml.trim()) {
				setMessages(exampleResult.filter((m) => m.type === 'TEST_END') as ITestEndMessage[]);
				return;
			}

			const response = await fetch('/api/reports', {
				method: 'POST',
				body: JSON.stringify({ yamlPlan }),
			});
			const messages = await response.json();

			setMessages((messages as TestMessage[]).filter((m) => m.type === 'TEST_END') as ITestEndMessage[]);
		} finally {
			setSubmitting(false);
		}
	};

	if (messages) {
		return (
			<div>
				<button
					class={cx('btn btn-default btn-ghost', tryBtn)}
					onClick={() => {
						setMessages(null);
					}}
				>
					edit test plan
				</button>
				<ReportTable messages={messages} />
			</div>
		);
	}

	return (
		<form onSubmit={(e) => e.preventDefault()}>
			<blockquote>
				You can try the example plan by clicking the button below.
				<br />
				Once you submit the example plan, it will display a previous recorded test result.
				<br />
				<button
					class={cx('btn btn-default btn-ghost', tryBtn)}
					onClick={() => {
						setYamlPlan(basicYaml);
					}}
				>
					try example plan template
				</button>
				<br />
				Or you can create your own test plan by filling the textarea below.&nbsp;
				<em>
					<a>How to plan a test?</a>
				</em>
				.
			</blockquote>

			<hr />

			<fieldset>
				<legend>create test report</legend>

				<div class="form-group">
					<label for="textarea">test plan</label>
					<textarea
						cols={30}
						rows={15}
						name="yamlPlan"
						placeholder="YAML format test plan"
						value={yamlPlan}
						onChange={(evt) => setYamlPlan((evt.currentTarget as HTMLTextAreaElement).value)}
					/>
				</div>

				<div class="form-group flex justify-end">
					<button
						class="btn btn-default"
						type="submit"
						role="button"
						name="submit"
						id="submit"
						onClick={handleSubmit}
						disabled={submitting}
					>
						{submitting ? '...' : 'Submit'}
					</button>
				</div>
			</fieldset>
		</form>
	);
}
