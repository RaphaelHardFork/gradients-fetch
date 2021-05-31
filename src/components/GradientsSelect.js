import { Fragment } from 'react'
import { useGradient } from '../hook/useGradient'

const GradientsSelect = () => {
  const { uniqueTags, filter, handleChangeFilter } = useGradient()

  return (
    <Fragment>
      <div className="input-group mb-3">
        <label className="input-group-text" htmlFor="select">
          Filtrer par tag
        </label>
        <select className="form-select" id="select" value={filter} onChange={handleChangeFilter}>
          <option value="tous">Tous</option>
          {uniqueTags.map((el) => (
            <option key={el} value={el}>
              {el}
            </option>
          ))}
        </select>
      </div>
    </Fragment>
  )
}

export default GradientsSelect
