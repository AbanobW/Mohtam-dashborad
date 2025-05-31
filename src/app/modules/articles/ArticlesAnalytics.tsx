import React, { useEffect, useState } from 'react'
import { Card } from 'react-bootstrap'
import { useAuth } from '../auth'
import ReactECharts from 'echarts-for-react'

interface ArticleData {
  title: string
  count: number
}

interface ArticleAnalytics {
  totalArticles: number
  activeArticles: number
  inactiveArticles: number
  articlesData: ArticleData[]
}

const ArticlesAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<ArticleAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { auth } = useAuth()

  const getChartOptions = () => {
    if (!analytics?.articlesData) return {}

    // Calculate height based on number of items (40px per item + padding)
    const itemHeight = 40
    const minHeight = 400
    const calculatedHeight = Math.max(minHeight, analytics.articlesData.length * itemHeight)

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
        containLabel: true,
        height: 'auto'
      },
      yAxis: {
        type: 'category',
        data: analytics.articlesData.map(item => item.title),
        axisLabel: {
          interval: 0
        }
      },
      xAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Count',
          type: 'bar',
          data: analytics.articlesData.map(item => item.count),
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
        const response = await fetch('https://api.mohtam.org/api/v1/admin/articles/analytics', {
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
          articlesData: data // Assuming the response is the array of article data
        })
        setError(null)
      } catch (err) {
        setError('Failed to fetch articles analytics')
        console.error('Error fetching articles analytics:', err)
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
              <h3 className='card-title fw-bold text-dark mb-7'>Articles Distribution</h3>
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <ReactECharts 
                  option={getChartOptions()} 
                  style={{ 
                    height: `${Math.max(400, (analytics?.articlesData?.length || 0) * 40)}px`,
                    minHeight: '400px'
                  }} 
                />
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </>
  )
}

export { ArticlesAnalytics } 