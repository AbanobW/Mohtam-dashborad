import React, { useEffect, useState } from 'react'
import { Card } from 'react-bootstrap'
import { toAbsoluteUrl } from '../../../_metronic/helpers'
import { useAuth } from '../auth'
import ReactECharts from 'echarts-for-react'

interface SubjectData {
  title: string
  count: number
}

interface SubjectAnalytics {
  totalSubjects: number
  activeSubjects: number
  inactiveSubjects: number
  subjectsData: SubjectData[]
}

const SubjectsAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<SubjectAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { auth } = useAuth()

  const getChartOptions = () => {
    if (!analytics?.subjectsData) return {}

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: analytics.subjectsData.map(item => item.title),
        axisLabel: {
          interval: 0,
          rotate: 45
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Count',
          type: 'bar',
          data: analytics.subjectsData.map(item => item.count),
          itemStyle: {
            color: '#3699FF'
          }
        }
      ]
    }
  }

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://api.mohtam.org/api/v1/admin/subjects/analytics', {
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setAnalytics({
          ...data,
          subjectsData: data // Assuming the response is the array of subject data
        })
        setError(null)
      } catch (err) {
        setError('Failed to fetch subjects analytics')
        console.error('Error fetching subjects analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [auth])

  if (loading) {
    return (
      <div className='card-xl-stretch mb-xl-8'>
        <Card>
          <Card.Body>
            <div className='d-flex align-items-center justify-content-center min-h-200px'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className='card-xl-stretch mb-xl-8'>
        <Card>
          <Card.Body>
            <div className='alert alert-danger'>
              {error}
            </div>
          </Card.Body>
        </Card>
      </div>
    )
  }

  return (
    <>
    

      <div className='row g-5 g-xl-8 mt-5'>
        <div className='col-xl-12'>
          <Card className='card-xl-stretch mb-xl-8'>
            <Card.Body>
              <h3 className='card-title fw-bold text-dark mb-7'>Subjects Distribution</h3>
              <ReactECharts option={getChartOptions()} style={{ height: '400px' }} />
            </Card.Body>
          </Card>
        </div>
      </div>
    </>
  )
}

export { SubjectsAnalytics }