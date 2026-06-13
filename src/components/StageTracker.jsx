import React from 'react'
import { STAGES, stageIndex } from '../data/seed.js'

// Slim, segmented pipeline tracker. Completed segments fill with the accent;
// the current node sits on a ring; a stuck current node pulses red.
export default function StageTracker({ order, compact = false }) {
  const current = stageIndex(order.stage)
  const isStuck = order.status === 'stuck'
  const isDone = order.status === 'done'

  return (
    <div className="flex w-full items-start">
      {STAGES.map((stage, i) => {
        const done = i < current || isDone
        const isCurrent = i === current && !isDone
        const stuckHere = isCurrent && isStuck

        let node = 'border-charcoal-300 bg-white text-charcoal-300' // pending
        if (done) node = 'border-teal-500 bg-teal-500 text-white'
        if (isCurrent && !stuckHere) node = 'border-teal-500 bg-white text-teal-600 ring-4 ring-teal-100'
        if (stuckHere) node = 'border-red-500 bg-red-500 text-white ring-4 ring-red-100 animate-pulse-ring'

        return (
          <React.Fragment key={stage}>
            <div className="flex shrink-0 flex-col items-center">
              <div
                className={`flex items-center justify-center rounded-full border-2 font-semibold transition-colors ${node} ${
                  compact ? 'h-4 w-4 text-[8px]' : 'h-6 w-6 text-[10px]'
                }`}
                title={stage}
              >
                {done ? (
                  <svg width={compact ? 9 : 12} height={compact ? 9 : 12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {!compact && (
                <span
                  className={`mt-1.5 w-12 text-center text-[10px] font-medium leading-tight ${
                    stuckHere
                      ? 'text-red-600'
                      : isCurrent
                        ? 'font-semibold text-teal-700'
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
              <div className={`mt-2 h-[3px] flex-1 rounded-full ${compact ? '' : ''} ${
                i < current || isDone ? 'bg-teal-500' : 'bg-charcoal-200'
              }`} style={{ marginTop: compact ? '7px' : '10px' }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
