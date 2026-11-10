// Pendaftaran mekanik: kandungan (data/activities.js), pengesahan (init/restore/check) dan paparan (komponen).
// usesCheck = jawapan disemak dengan butang "Semak"; selain itu permainan menyemak sendiri (padanan, pilih pintu).
import * as matching from './MatchingGame.jsx';
import * as pick from './PickAnswerGame.jsx';
import * as quiz from './QuizGame.jsx';
import * as dropcount from './DropCountGame.jsx';
import * as puzzle from './PuzzleGame.jsx';
import * as sorting from './SortingGame.jsx';
import * as ordering from './OrderingGame.jsx';
import * as fill from './FillBlankGame.jsx';
import * as butterfly from './ButterflyGame.jsx';
import * as watermelon from './WatermelonGame.jsx';
import * as owl from './OwlGame.jsx';

const withDefaults = (m, usesCheck) => ({ ...m, Component: m.default, usesCheck });

export const MECHANICS = {
  matching: withDefaults(matching, false),
  pick: withDefaults(pick, false),
  quiz: withDefaults(quiz, false),
  dropcount: withDefaults(dropcount, true),
  puzzle: withDefaults(puzzle, true),
  sorting: withDefaults(sorting, true),
  ordering: withDefaults(ordering, true),
  fill: withDefaults(fill, true),
  butterfly: withDefaults(butterfly, false),
  watermelon: withDefaults(watermelon, false),
  owl: withDefaults(owl, false),
};
