import { EventInput } from '@fullcalendar/core';
import { Tache } from './task.service';

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
