import { EventContentArg, EventInput, SlotLabelContentArg } from '@fullcalendar/core';
import { Tache } from './task.service';
import { getWeekNumber } from './date-utils';

export interface EventInputWithClassNames extends EventInput {
  classNames?: string[];
}

export function computeEndDate(start: string, dureeHeures: number): string {
  const date = new Date(start);
  date.setHours(date.getHours() + dureeHeures);
  return date.toISOString();
}

export function buildCalendarEvents(taches: Tache[]): EventInputWithClassNames[] {
  return taches.map(tache => ({
    id: tache.id?.toString(),
    title: tache.titre,
    start: tache.dateDebut,
    end: computeEndDate(tache.dateDebut, tache.dureeEnHeures),
    resourceId: tache.agentId?.toString(),
    extendedProps: {
      id: tache.id,
      description: tache.description,
      priorite: tache.priorite,
      agentId: tache.agentId,
      etat: tache.etat,
      codeColor: tache.codeColor,
      cadre: tache.cadre,
      conteneur: tache.conteneur
    },
    classNames: [] as string[]
  }));
}

export function checkForConflicts(events: EventInputWithClassNames[]) {
  const conflicts: { [resourceId: string]: EventInputWithClassNames[][] } = {};

  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const a = events[i];
      const b = events[j];

      if (a.resourceId && b.resourceId && a.resourceId === b.resourceId) {
        if (!a.start || !a.end || !b.start || !b.end) continue;

        const startA = new Date(a.start as string | Date).getTime();
        const endA = new Date(a.end as string | Date).getTime();
        const startB = new Date(b.start as string | Date).getTime();
        const endB = new Date(b.end as string | Date).getTime();

        if (startA < endB && startB < endA) {
          if (!conflicts[a.resourceId]) {
            conflicts[a.resourceId] = [];
          }
          conflicts[a.resourceId].push([a, b]);
        }
      }
    }
  }

  return conflicts;
}

// Les 3 fonctions suivantes construisent le HTML affiche dans le calendrier
// (contenu d'un evenement, d'une etiquette d'horaire, d'un agent en colonne).
// Sorties du composant pour qu'il reste lisible, pas pour etre reutilisees ailleurs.
export function renderEventContent(info: EventContentArg) {
  const tache = info.event.extendedProps as Tache;

  const color = tache.codeColor || '#6366f1';
  const isCadre = tache.cadre === true;
  const isConteneur = tache.conteneur === true;

  const textColor = isConteneur ? 'white' : '#1f2937';
  const backgroundColor = isConteneur ? color : '#f3f4f6';
  const borderColor = isCadre ? '#ef4444' : color;
  const border = isCadre ? '3px solid' : '1px solid';

  const opacity = info.isPast ? '0.7' : '1';

  return {
    html: `
      <div style="
        background-color: ${backgroundColor};
        color: ${textColor};
        border: ${border};
        border-color: ${borderColor};
        border-radius: 8px;
        padding: 6px 10px;
        font-size: 0.85em;
        font-weight: 600;
        text-align: center;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: all 0.2s ease;
        opacity: ${opacity};
        box-sizing: border-box;
        min-height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${info.timeText ? `<span style="font-size:0.7em; opacity:0.9;">${info.timeText}</span><br/>` : ''}
        <span>${info.event.title}</span>
      </div>
    `
  };
}

export function renderSlotLabelContent(arg: SlotLabelContentArg) {
  const date = new Date(arg.date);
  const day = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  const weekNumber = getWeekNumber(date);

  if (date.getDay() === 1) {
    return {
      html: `
        <div style="text-align:center; padding: 4px;">
          <div style="font-weight:600; color:#1f2937;">${day}</div>
          <div style="
            background:#e0e0e0;
            color:#4b5563;
            border-radius:4px;
            padding:2px 6px;
            font-size:0.75em;
            font-weight:500;
            margin-top:4px;
            display:inline-block;">
            Semaine ${weekNumber}
          </div>
        </div>
      `
    };
  }

  return {
    html: `<div style="text-align:center; padding:4px; color:#4b5563; font-size:0.85em;">${day}</div>`
  };
}

// Le type exact vient de @fullcalendar/resource, pas du coeur de la lib :
// pas la peine de traquer cet import pour une fonction aussi simple.
export function renderResourceLabelContent(info: any) {
  return {
    html: `
      <div style="
        font-weight:600;
        color:#1f2937;
        padding:8px;
        margin-bottom: 4px;
      ">
        ${info.resource.title}
      </div>
    `
  };
}

export function markConflicts(events: EventInputWithClassNames[]): void {
  const conflicts = checkForConflicts(events);
  for (const resourceId in conflicts) {
    conflicts[resourceId].forEach(([eventA, eventB]) => {
      if (eventA.classNames && !eventA.classNames.includes('conflict')) {
        eventA.classNames.push('conflict');
      }
      if (eventB.classNames && !eventB.classNames.includes('conflict')) {
        eventB.classNames.push('conflict');
      }
    });
  }
}
