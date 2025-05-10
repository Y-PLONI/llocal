import { useLocal } from '@renderer/hooks/useLocal'
import { useOllama } from '@renderer/hooks/useOllama'
import { modelListAtom, prefModelAtom } from '@renderer/store/mocks'
import { Dropdown } from '@renderer/ui/Dropdown'
import { DropDownSelector } from '@renderer/ui/DropdownSelector'
import { t } from '@renderer/utils/utils'
import { useAtomValue } from 'jotai'
import React, { ChangeEvent, ComponentProps, useEffect } from 'react'
import { IoChevronDown } from 'react-icons/io5'
import { twMerge } from 'tailwind-merge'

export const ChooseModel = ({ className, ...props }: ComponentProps<'div'>): React.ReactElement => {
  const { listModels } = useOllama()
  // TODO: Need to figure out a way, to not show all-minilm here and still populate the main-list
  // most probably just making a new state like the one below should work.
  // const [listMod, setListMod] = useState<listModels[]>([])
  const modelList = useAtomValue(modelListAtom)

  const { setModelChoice, setList } = useLocal()
  const prefModel = useAtomValue(prefModelAtom)

  useEffect(() => {
    async function list(): Promise<void> {
      const response = await listModels()
      if (!prefModel && response.length > 0) {
        setModelChoice(`${response[0].modelName}`)
      }
      setList(response)
    }
    list()
  }, [prefModel])

  function handleChange(e: ChangeEvent<HTMLSelectElement>): void {
    const val = e.target.value
    setModelChoice(val)
  }

  return (
    <div className={twMerge('flex flex-col gap-2 justify-center ', className)} {...props}>
      <h1 className="font-thin">{t('Choose a model :')}</h1>
      <div className="relative">
        <Dropdown defaultValue={prefModel && prefModel} onChange={handleChange} className="w-96">
          {modelList &&
            modelList.map((val, index) => {
              return (
                <DropDownSelector
                  key={index}
                  value={`${val.modelName}`}
                >{`${val.modelName}`}</DropDownSelector>
              )
            })}
        </Dropdown>
        <IoChevronDown className="text-2xl absolute right-5 top-1/2 transform -translate-y-1/2" />
      </div>
    </div>
  )
}
