import { useSearchParams } from 'react-router-dom'
import ContratosList from './components/ContratoList'
import FormContratoServicios from './components/FormContratoServicios'
import FormContratoAgente from './components/FormContratoAgente'
import FormContratoAnticreticoServicios from './components/FormContratoAnticreticoServicios'



const ContratoPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const contratoType = searchParams.get('type')

  const handleCreateContrato = (type) => {
    setSearchParams({ type })
  }

  const handleBack = () => {
    setSearchParams({})
  }

  const renderForm = () => {
    switch (contratoType) {
      case 'servicios-antireticos-inmobiliarios':
        return <FormContratoAnticreticoServicios onBack={handleBack} />
      case 'servicios-inmobiliarios':
        return <FormContratoServicios onBack={handleBack} />
      case 'agente':
        return <FormContratoAgente onBack={handleBack} />
      default:
        return <ContratosList onCreateContrato={handleCreateContrato} />
    }
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>{renderForm()}</div>
    </div>
  )
}

export default ContratoPage
