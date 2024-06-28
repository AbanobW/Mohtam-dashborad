
import clsx from 'clsx'
import {FC} from 'react'
import {useLayout} from '../../core'
import {DefaultTitle} from '../header/page-title/DefaultTitle'

const Toolbar2: FC = () => {
  const {classes, config} = useLayout()
  return (
    <div className='toolbar py-2' id='kt_toolbar'>
      {/* begin::Container */}
      <div
        id='kt_toolbar_container'
        className={clsx(classes.toolbarContainer.join(' '), 'd-flex align-items-center')}
      >
        {config.pageTitle?.display && <DefaultTitle />}

        <div className='flex-grow-1 flex-shrink-0 me-5'></div>

        {/* begin::Actions */}
        <div
          className={
            config.pageTitle?.display
              ? 'd-flex align-items-center flex-wrap'
              : 'd-flex flex-stack flex-grow-1 flex-wrap'
          }
        >
      

          
        </div>
        {/* end::Actions */}
      </div>
      {/* end::Container */}
    </div>
  )
}

export {Toolbar2}
