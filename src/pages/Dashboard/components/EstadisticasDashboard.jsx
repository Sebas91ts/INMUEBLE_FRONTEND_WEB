import {
  AlertTriangle,
  Building,
  DollarSign,
  Users,
  Wrench,
  User,
  Shield,
  Calendar
} from 'lucide-react'

const stats = [
  {
    title: 'Unidades Totales',
    value: '248',
    change: '+2.1%',
    icon: Building,
    color: 'bg-blue-500'
  },
  {
    title: 'Clientes Activos',
    value: '542',
    change: '+5.4%',
    icon: Users,
    color: 'bg-green-500'
  },
  {
    title: 'Ingresos Mensuales',
    value: '$47,250',
    change: '+8.2%',
    icon: DollarSign,
    color: 'bg-purple-500'
  }
]
const recentActivities = [
  {
    accion: 'Cambio de Contraseña',
    fecha: 'Hace 2 horas',
    hora: '10:00 AM',
    ip: '89.207.132.170',
    icon: Shield
  },
  {
    accion: 'Cambio de Contraseña',
    fecha: 'Hace 2 horas',
    hora: '10:00 AM',
    ip: '89.207.132.170',
    icon: Shield
  },
  {
    accion: 'Cambio de Contraseña',
    fecha: 'Hace 2 horas',
    hora: '10:00 AM',
    ip: '89.207.132.170',
    icon: Shield
  }
]

export default function EstadisticasDashboard() {
  return (
    <div>
      <div className='p-6 space-y-6'>
        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
          {stats.map((stat, index) => (
            <div
              key={index}
              className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow'
            >
              <div className='flex items-center justify-between mb-4'>
                <div
                  className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}
                >
                  <stat.icon className='w-6 h-6 text-white' />
                </div>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded-full ${
                    stat.change.startsWith('+')
                      ? 'text-green-700 bg-green-100'
                      : 'text-red-700 bg-red-100'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <h3 className='text-2xl font-bold text-gray-900 mb-1'>
                {stat.value}
              </h3>
              <p className='text-gray-600 text-sm'>{stat.title}</p>
            </div>
          ))}
        </div>

        <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
          {/* Recent Activity */}
          <div className='xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-bold text-gray-900'>
                Actividad Reciente
              </h2>
              <button className='text-blue-600 hover:text-blue-800 text-sm font-medium'>
                Recargar
              </button>
            </div>
            <div className='space-y-4'>
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className='flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors'
                >
                  <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center'>
                    <User className='w-5 h-5 text-gray-600' />
                  </div>
                  <div className='flex-1'>
                    <p className='text-gray-900 font-medium'>
                      {activity.accion}
                    </p>
                    <p className='text-gray-500 text-sm mt-1'>
                      {activity.fecha} {activity.hora} - IP:{' '}
                      {activity.ip || 'Desconocida'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
