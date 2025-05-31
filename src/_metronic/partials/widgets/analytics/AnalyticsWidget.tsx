import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { useAuth } from '../../../../app/modules/auth';
import { KTIcon } from '../../../helpers';

type Props = {
  className: string;
};

const AnalyticsWidget: React.FC<Props> = ({ className }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const { auth } = useAuth();
  const [totalUsers, setTotalUsers] = useState<number>(0);

  // Calculate milestone and growth metrics
  const calculateGrowthMetrics = (currentUsers: number) => {
    const milestones = [100, 200, 300, 400, 500];
    const currentMilestone = milestones.find(m => currentUsers <= m) || milestones[milestones.length - 1];
    const previousMilestone = milestones[milestones.findIndex(m => m === currentMilestone) - 1] || 0;
    
    const progress = ((currentUsers - previousMilestone) / (currentMilestone - previousMilestone)) * 100;
    const remaining = currentMilestone - currentUsers;
    
    return {
      currentMilestone,
      previousMilestone,
      progress: Math.round(progress),
      remaining,
      nextTarget: currentMilestone
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://api.mohtam.org/api/v1/admin/users/analytics',
          {
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setTotalUsers(data.total_users);

        const metrics = calculateGrowthMetrics(data.total_users);

        if (chartRef.current) {
          if (!chartInstance.current) {
            chartInstance.current = echarts.init(chartRef.current);
          }

          const option = {
            tooltip: {
              trigger: 'item'
            },
            legend: {
              show: false
            },
            series: [
              {
                name: 'User Analytics',
                type: 'pie',
                radius: ['70%', '90%'],
                avoidLabelOverlap: false,
                label: {
                  show: false,
                  position: 'center'
                },
                emphasis: {
                  label: {
                    show: true,
                    fontSize: '20',
                    fontWeight: 'bold',
                    color: '#fff'
                  }
                },
                labelLine: {
                  show: false
                },
                data: [
                  { 
                    value: data.total_users, 
                    name: 'Current Users',
                    itemStyle: {
                      color: '#3699FF'
                    }
                  },
                  { 
                    value: metrics.remaining,
                    name: 'Until Next Milestone',
                    itemStyle: {
                      color: 'rgba(54, 153, 255, 0.2)'
                    }
                  }
                ]
              }
            ]
          };

          chartInstance.current.setOption(option);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };

    fetchData();

    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [auth?.accessToken]);

  const metrics = calculateGrowthMetrics(totalUsers);
  const growthStatus = metrics.progress >= 75 ? 'success' : metrics.progress >= 50 ? 'warning' : 'primary';

  return (
    <>
      <div className={`card ${className}`}>
        <div className="card-header border-0 pt-5">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold fs-3 mb-1">User Analytics Overview</span>
            <span className="text-muted fw-semibold fs-7">User growth and statistics</span>
          </h3>
        </div>
        <div className="card-body">
          <div className="row g-3 g-lg-6">
            {/* Total Users Card */}
            <div className="col-6">
              <div className="bg-gray-100 bg-opacity-70 rounded-2 px-6 py-5">
                <div className="symbol symbol-30px me-5 mb-4">
                  <span className="symbol-label bg-primary">
                    <KTIcon iconName="user" className="fs-2 text-white" />
                  </span>
                </div>
                <div className="d-flex align-items-center">
                  <div className="text-gray-900 fw-bolder fs-2 mb-0 me-6">{totalUsers}</div>
                  <div className="fw-bold fs-6 text-gray-400">Total Users</div>
                </div>
              </div>
            </div>

            {/* Growth Progress Card */}
            <div className="col-6">
              <div className="bg-gray-100 bg-opacity-70 rounded-2 px-6 py-5">
                <div className="symbol symbol-30px me-5 mb-4">
                  <span className={`symbol-label bg-${growthStatus}`}>
                    <KTIcon iconName="arrow-up" className="fs-2 text-white" />
                  </span>
                </div>
                <div className="d-flex flex-column">
                  <div className="d-flex align-items-center">
                    <div className="text-gray-900 fw-bolder fs-2 mb-0 me-6">{metrics.progress}%</div>
                    <div className="fw-bold fs-6 text-gray-800 d-flex align-items-center">Growth Progress <span className="d-inline-block ms-2 text-gray-400">({metrics.remaining} users until {metrics.nextTarget})</span> </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div ref={chartRef} style={{ height: '250px', width: '100%' }} />
            <div className="d-flex flex-column mt-5">
              <div className="d-flex justify-content-center">
                <div className="d-flex align-items-center me-6">
                  <span className="rounded-circle w-15px h-15px bg-primary me-2"></span>
                  <span className="fs-7 text-gray-600">Current Users ({totalUsers})</span>
                </div>
                <div className="d-flex align-items-center">
                  <span className="rounded-circle w-15px h-15px bg-primary opacity-25 me-2"></span>
                  <span className="fs-7 text-gray-600">Until Next Milestone ({metrics.remaining})</span>
                </div>
              </div>
              <div className="text-center mt-4">
                <span className="fs-6 text-gray-400">
                  Next Milestone: {metrics.nextTarget} Users
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { AnalyticsWidget }; 