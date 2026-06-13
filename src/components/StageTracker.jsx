import React from 'react'
import { STAGES, stageIndex } from '../data/seed.js'

// Horizontal pipeline tracker. Completed stages = teal, current = highlighted,
// a stuck current stage pulses red, pending stages are grey.
export default function StageTracker({ order, compact = false }) {
  const current = stageIndex(order.stage)
  const isStuck = order.status === 'stuck'
  const isDone = order.status === 'done'

  return (
    <div className="flex items-center w-full">
      {STAGES.map((stage, i) => {
        const done = i < current || isDone
        const isCurrent = i === current && !isDone
        const stuckHere = isCurrent && isStuck

        let dotClass = 'bg-charcoal-200 text-charcoal-400' // pending
        if (done) dotClass = 'bg-teal-500 text-white'
        if (isCurrent && !stuckHere) dotClass = 'bg-teal-600 text-white ring-4 ring-teal-200'
        if (stuckHere) dotClass = 'bg-red-500 text-white ring-4 ring-red-200 animate-pulse-red'

        return (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center shrink-0">
              <div
                className={`flex items-center justify-center rounded-full font-semibold transition-colors ${dotClass} ${
                  compact ? 'h-5 w-5 text-[9px]' : 'h-7 w-7 text-[11px]'
                }`}
                title={stage}
              >
                {done ? '✓' : i + 1}
              </div>
              {!compact && (
                <span
                  className={`mt-1 text-[10px] leading-tight text-center w-12 ${
                    stuckHere
                      ? 'text-red-600 font-semibold'
                      : isCurrent
                        ? 'text-teal-700 font-semibold'
                        : done
                          ? 'text-charcoal-500'
                          : 'text-charcoal-300'
                  }`}
                >
                  {stage}
                </span>
              )}
            </div>
            {i < STAGES.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-0.5 ${compact ? 'mb-0' : 'mb-5'} ${
                  i < current || isDone ? 'bg-teal-400' : 'bg-charcoal-200'
                }`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
