'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'

type CategoryComboboxProps = {
  name: string
  categories: string[]
  defaultValue?: string
  placeholder?: string
}

export default function CategoryCombobox({
  name,
  categories,
  defaultValue = '',
  placeholder = 'Choose or type a category',
}: CategoryComboboxProps) {
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const matches = categories.filter((category) => category.toLowerCase().includes(value.trim().toLowerCase()))

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  function choose(category: string) {
    setValue(category)
    setOpen(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((current) => matches.length ? (current + 1) % matches.length : 0)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((current) => matches.length ? (current - 1 + matches.length) % matches.length : 0)
    } else if (event.key === 'Enter' && open && matches[activeIndex]) {
      event.preventDefault()
      choose(matches[activeIndex])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value.trim()} />
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#728196]" />
        <input
          ref={inputRef}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={open && matches[activeIndex] ? `${listboxId}-${activeIndex}` : undefined}
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            setActiveIndex(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border border-[#d8e0ea] bg-white pl-10 pr-20 text-sm font-semibold text-[#182333] outline-none transition-colors placeholder:text-[#8b98a8] hover:bg-[#fafbfd] focus:border-[#ff5f14] focus:bg-white focus:ring-4 focus:ring-[#ff5f14]/10"
        />
        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center">
          {value && (
            <button
              type="button"
              onClick={() => {
                setValue('')
                setActiveIndex(0)
                setOpen(true)
                inputRef.current?.focus()
              }}
              aria-label="Clear category"
              className="grid h-9 w-9 place-items-center rounded-md text-[#728196] hover:bg-[#edf1f5] hover:text-[#061f3f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5f14]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setOpen((current) => !current)
              inputRef.current?.focus()
            }}
            aria-label={open ? 'Close category options' : 'Open category options'}
            className="grid h-9 w-9 place-items-center rounded-md text-[#728196] hover:bg-[#edf1f5] hover:text-[#061f3f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5f14]"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Product categories"
          className="absolute z-40 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-[#d8e0ea] bg-white p-1.5 shadow-xl shadow-[#03152d]/10"
        >
          {matches.length > 0 ? (
            matches.map((category, index) => {
              const selected = category.toLowerCase() === value.trim().toLowerCase()
              const active = index === activeIndex
              return (
                <button
                  key={category}
                  id={`${listboxId}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(category)}
                  className={`flex min-h-11 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5f14] ${
                    active ? 'bg-[#f4f7fa] text-[#061f3f]' : 'text-[#4b5a6a]'
                  }`}
                >
                  <span>{category}</span>
                  {selected && <Check className="h-4 w-4 text-[#ff5f14]" />}
                </button>
              )
            })
          ) : (
            <div className="px-3 py-3 text-sm">
              <p className="font-bold text-[#061f3f]">Use “{value.trim()}”</p>
              <p className="mt-1 text-xs font-medium text-[#728196]">This will create a custom category value.</p>
            </div>
          )}
        </div>
      )}
      <p className="mt-1.5 min-h-4 text-xs font-medium text-[#728196]">Choose an existing category or type a new one.</p>
    </div>
  )
}
