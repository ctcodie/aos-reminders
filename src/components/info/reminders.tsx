import React, { useMemo, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { IconContext } from 'react-icons'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'
import ReactTooltip from 'react-tooltip'
import './reminders.css'
import { realmscape, factionNames, selections, army } from 'ducks'
import { processReminders } from 'utils/processReminders'
import { titleCase } from 'utils/titleCase'
import { TSupportedFaction } from 'meta/factions'
import { ISelections, IAllySelections } from 'types/selections'
import { IArmy, TAllyArmies } from 'types/army'
import { ITurnAction } from 'types/data'
import { without, uniq } from 'lodash'

interface IRemindersProps {
  allyArmies: TAllyArmies
  allySelections: { [key: string]: IAllySelections }
  allyFactionNames: TSupportedFaction[]
  army: IArmy
  factionName: TSupportedFaction
  realmscape_feature: string
  selections: ISelections
}

const RemindersComponent = (props: IRemindersProps) => {
  const { factionName, selections, army, realmscape_feature, allyArmies, allySelections, allyFactionNames } = props

  const reminders = useMemo(() => {
    const allyData = allyFactionNames.map(name => ({
      allyArmy: allyArmies[name],
      allySelections: allySelections[name],
    }))
    return processReminders(army, factionName, selections, realmscape_feature, allyData)
  }, [army, factionName, selections, realmscape_feature, allyArmies, allySelections, allyFactionNames])

  return (
    <div className="row w-75 mx-auto mt-3 d-block">
      <div>
        {Object.keys(reminders).map((key, i) => {
          return <Entry when={key} actions={reminders[key]} key={i} idx={i} factionName={factionName} />
        })}
      </div>
    </div>
  )
}

const Entry = (props: { when: string; actions: ITurnAction[]; idx: number; factionName: TSupportedFaction }) => {
  const { when, actions } = props

  const [hidden, setHidden] = useState([] as string[])
  const showEntry = (name: string) => setHidden(without([...hidden], name))
  const hideEntry = (name: string) => setHidden(uniq([...hidden, name]))

  return (
    <div className={`row d-block PageBreak ${hidden.length === actions.length && `d-print-none`}`}>
      <div className="card border-dark my-3">
        <div className="card-header text-center">
          <h4 className="ReminderHeader">{titleCase(when)}</h4>
        </div>
        <div className="card-body">
          {actions.map((action, i) => (
            <ActionText {...action} key={i} showEntry={showEntry} hideEntry={hideEntry} />
          ))}
        </div>
      </div>
    </div>
  )
}

const getTitle = ({
  allegiance_ability,
  artifact,
  command_ability,
  command_trait,
  condition,
  endless_spell,
  name,
  spell,
}: ITurnAction): string => {
  const nameIfDifferent = name === condition ? `` : `: ${condition}`
  if (spell) return `Spell${nameIfDifferent}`
  if (endless_spell) return `Endless Spell${nameIfDifferent}`
  if (artifact) return `Artifact${nameIfDifferent}`
  if (allegiance_ability || command_ability) return condition
  if (command_trait) return `Command Trait`
  return condition
}

const VisibilityToggle = (props: { isVisible: boolean; setVisibility: (e) => void }) => {
  const { isVisible, setVisibility } = props
  const VisibilityComponent = isVisible ? MdVisibility : MdVisibilityOff
  const tipProps = {
    'data-for': `reminderTooltip`,
    'data-tip': isVisible ? `Click to hide this rule.` : `This rule will not be printed.`,
    'data-type': `info`,
  }
  return (
    <>
      <div {...tipProps}>
        <IconContext.Provider value={{ size: '1.4em' }}>
          <VisibilityComponent onClick={setVisibility} />
        </IconContext.Provider>
        <ReactTooltip id={`reminderTooltip`} />
      </div>
    </>
  )
}

interface IActionTextProps extends ITurnAction {
  hideEntry: (name: string) => void
  showEntry: (name: string) => void
}

const ActionText = (props: IActionTextProps) => {
  const { name, desc, command_ability, tag, showEntry, hideEntry } = props
  const [isVisible, setIsVisibile] = useState(true)
  const handleVisibility = e => {
    e.preventDefault()
    !isVisible ? showEntry(name as string) : hideEntry(name as string)
    setIsVisibile(!isVisible)
  }

  useEffect(() => {
    return () => {
      showEntry(name as string) // Remove this from the hidden array on unload
    }
    // eslint-disable-next-line
  }, [])

  return (
    <div className={`ReminderEntry mb-2 ${!isVisible && `d-print-none`}`}>
      <div className="d-flex">
        <div className="flex-grow-1">
          <span className="text-muted font-weight-bold">{getTitle(props)} - </span>
          <b>
            {command_ability && `Command Ability: `}
            {name && `${name}`}
            {tag && ` (${tag})`}
          </b>
        </div>
        <div className="px-2 d-print-none">
          <VisibilityToggle isVisible={isVisible} setVisibility={handleVisibility} />
        </div>
      </div>

      {isVisible && desc}
    </div>
  )
}

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  allyArmies: army.selectors.getAllyArmies(state),
  allyFactionNames: selections.selectors.getAllyFactionNames(state),
  allySelections: selections.selectors.getAllySelections(state),
  army: army.selectors.getArmy(state),
  factionName: factionNames.selectors.getFactionName(state),
  realmscape_feature: realmscape.selectors.getRealmscapeFeature(state),
  selections: selections.selectors.getSelections(state),
})

export const Reminders = connect(
  mapStateToProps,
  null
)(RemindersComponent)
