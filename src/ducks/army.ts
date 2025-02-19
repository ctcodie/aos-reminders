import { createSlice, createSelector } from 'redux-starter-kit'
import { IArmy, TAllyArmies } from 'types/army'
import { Game } from 'meta/game_structure'
import { TSupportedFaction } from 'meta/factions'
import { getArmy } from 'utils/getArmy'

type TInitialStateType = {
  army: IArmy
  allyArmies: TAllyArmies
}

const initialState: TInitialStateType = {
  army: {
    Abilities: [],
    Artifacts: [],
    Battalions: [],
    EndlessSpells: [],
    Spells: [],
    Traits: [],
    Units: [],
    Game: Game,
  },
  allyArmies: {},
}

const resetArmy = (state, action) => {
  state.army = initialState.army
}
const resetAllyArmies = (state, action) => {
  state.allyArmies = initialState.allyArmies
}
const updateArmy = (state, action: { payload: IArmy }) => {
  state.army = action.payload
}
const updateAllyArmy = (state, action: { payload: { factionName: TSupportedFaction; Army: IArmy } }) => {
  const { factionName, Army } = action.payload
  state.allyArmies[factionName] = Army
}
const switchAllyArmy = (state, action: { payload: { next: TSupportedFaction; prev: TSupportedFaction } }) => {
  const { next, prev } = action.payload
  delete state.allyArmies[prev]
  state.allyArmies[next] = getArmy(next)
}
const deleteAllyArmy = (state, action: { payload: TSupportedFaction }) => {
  delete state.allyArmies[action.payload]
}

export const army = createSlice({
  slice: 'army',
  initialState,
  reducers: {
    deleteAllyArmy,
    switchAllyArmy,
    resetAllArmies: (state, action) => initialState,
    resetAllyArmies,
    resetArmy,
    updateAllyArmy,
    updateArmy,
  },
})

army.selectors.getArmy = createSelector(
  ['army.army'],
  army => army
)

army.selectors.getAllyArmies = createSelector(
  ['army.allyArmies'],
  allyArmies => allyArmies
)
