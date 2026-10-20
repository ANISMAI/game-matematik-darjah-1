// Pendaftaran mekanik: kandungan (data/activities.js), pengesahan (init/restore/check) dan paparan (komponen).
// usesCheck = jawapan disemak dengan butang "Semak"; selain itu permainan menyemak sendiri (padanan, pilih pintu).
import * as matching from './MatchingGame.jsx';
import * as pick from './PickAnswerGame.jsx';
import * as puzzle from './PuzzleGame.jsx';
import * as sorting from './SortingGame.jsx';
import * as ordering from './OrderingGame.jsx';
import * as fill from './FillBlankGame.jsx';

const withDefaults = (m, usesCheck) => ({ ...m, Component: m.default, usesCheck });

export const MECHANICS = {
  matching: withDefaults(matching, false),
  pick: withDefaults(pick, false),
  puzzle: withDefaults(puzzle, true),
  sorting: withDefaults(sorting, true),
  ordering: withDefaults(ordering, true),
  fill: withDefaults(fill, true),
};
