import React from 'react'
import {MenuItem} from './MenuItem'
import {MenuInnerWithSub} from './MenuInnerWithSub'
import {MegaMenu} from './MegaMenu'
import {useIntl} from 'react-intl'

export function MenuInner() {
  const intl = useIntl()
  return (
    <>
      <MenuItem title={'Mohtam Admin Panel'} to='/dashboard' />
      {/* <MenuItem title='Layout Builder' to='/builder' /> */}


    
    </>
  )
}
