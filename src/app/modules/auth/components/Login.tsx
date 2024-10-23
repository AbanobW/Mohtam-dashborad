import { useState } from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { useFormik } from 'formik'
import { getUserByToken, login } from '../core/_requests'
import { toAbsoluteUrl } from '../../../../_metronic/helpers'
import { useAuth } from '../core/Auth'

const loginSchema = Yup.object().shape({
  userName: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('User Name is required'),
  password: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password is required'),
})

const initialValues = {
  // userName: 'admon',
  userName: '',
  password: '',
  // password: '1q2w3eX#',
}

export function Login() {
  const [loading, setLoading] = useState(false)
  const { saveAuth, setCurrentUser } = useAuth()

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true)
      try {
        const auth = await login(values.userName, values.password)
        saveAuth(auth)
        const { data: user } = await getUserByToken(auth.accessToken)
        setCurrentUser(user)
      } catch (error) {
        console.error(error)
        saveAuth(undefined)
        setStatus('The login details are incorrect')
        setSubmitting(false)
        setLoading(false)
      }
    },
  })

  return (
    <form
      className='form w-100'
      onSubmit={formik.handleSubmit}
      noValidate
      id='kt_login_signin_form'
    >
      <div className='text-center mb-11'>
        <Link to='/' className='mb-12'>
          <img alt='Logo' src={toAbsoluteUrl('media/logos/demo6light.svg')} className='h-75px mb-5' />
        </Link>
        <h1 className='text-gray-900 fw-bolder mb-3'>Sign In</h1>
      </div>

      {formik.status ? (
        <div className='mb-lg-15 alert alert-danger'>
          <div className='alert-text font-weight-bold'>{formik.status}</div>
        </div>
      ) : (
        <div className='mb-10 bg-light-info p-8 rounded'>
          <div className='text-info'>
            Use account <strong>admin</strong> and password <strong>demo</strong> to continue.
          </div>
        </div>
      )}

      <div className='fv-row mb-8'>
        <label className='form-label fs-6 fw-bolder text-gray-900'>User Name</label>
        <input
          placeholder='User Name'
          {...formik.getFieldProps('userName')}
          className={clsx(
            'form-control bg-transparent',
            { 'is-invalid': formik.touched.userName && formik.errors.userName },
            { 'is-valid': formik.touched.userName && !formik.errors.userName }
          )}
          type='text'
          name='userName'
          autoComplete='off'
        />
        {formik.touched.userName && formik.errors.userName && (
          <div className='fv-plugins-message-container'>
            <span role='alert'>{formik.errors.userName}</span>
          </div>
        )}
      </div>

      <div className='fv-row mb-3'>
        <label className='form-label fw-bolder text-gray-900 fs-6 mb-0'>Password</label>
        <input
          type='password'
          autoComplete='off'
          {...formik.getFieldProps('password')}
          className={clsx(
            'form-control bg-transparent',
            { 'is-invalid': formik.touched.password && formik.errors.password },
            { 'is-valid': formik.touched.password && !formik.errors.password }
          )}
        />
        {formik.touched.password && formik.errors.password && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.password}</span>
            </div>
          </div>
        )}
      </div>

      <div className='d-flex flex-stack flex-wrap gap-3 fs-base fw-semibold mb-8'>
        <div />
      </div>

      <div className='d-grid mb-10'>
        <button
          type='submit'
          id='kt_sign_in_submit'
          className='btn btn-primary'
          disabled={formik.isSubmitting || !formik.isValid}
        >
          {!loading && <span className='indicator-label'>Continue</span>}
          {loading && (
            <span className='indicator-progress' style={{ display: 'block' }}>
              Please wait...
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          )}
        </button>
      </div>
    </form>
  )
}