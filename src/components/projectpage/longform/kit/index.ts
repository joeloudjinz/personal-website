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
import TileGrid from './TileGrid.astro';
import LedgerTape from './LedgerTape.astro';
import Waterfall from './Waterfall.astro';
import FlowGraph from './FlowGraph.astro';
import LayerStack from './LayerStack.astro';
import Timeline from './Timeline.astro';
import MirrorPair from './MirrorPair.astro';
import BidiCase from './BidiCase.astro';
import PartsBuild from './PartsBuild.astro';
import BrandMark from './BrandMark.astro';
import DataTable from '@src/components/DataTable.astro';
import CodeBlock from '@src/components/CodeBlock.astro';

export const kit = {
  PhoneFrame, PhonePair, Figure, Example, ForEngineers, Callout, Quote, StateMachine,
  TileGrid, LedgerTape, Waterfall, FlowGraph, LayerStack, Timeline, MirrorPair, BidiCase,
  PartsBuild, BrandMark, DataTable, CodeBlock
};
