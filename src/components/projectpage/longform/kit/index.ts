// The components a chapter file may use without importing. Passed to each
// chapter's <Content components={kit}/>, so a chapter writes <PhoneFrame> and
// never reaches into src/components itself.
import PhoneFrame from './PhoneFrame.astro';
import PhonePair from './PhonePair.astro';
import Figure from './Figure.astro';
import Example from './Example.astro';
import ForEngineers from './ForEngineers.astro';
import Callout from './Callout.astro';
import Quote from './Quote.astro';
import StateMachine from './StateMachine.astro';
import DataTable from '@src/components/DataTable.astro';
import CodeBlock from '@src/components/CodeBlock.astro';

export const kit = {
  PhoneFrame, PhonePair, Figure, Example, ForEngineers, Callout, Quote, StateMachine, DataTable, CodeBlock
};
