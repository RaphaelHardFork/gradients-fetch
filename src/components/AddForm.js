import { useState } from 'react'
import { useIsMounted } from '../hook/useIsMounted'
import { useGradient } from '../hook/useGradient'

const AddForm = () => {
  const { message, dispatch } = useGradient()
  const isMounted = useIsMounted()
  const [start, setStart] = useState('#000000')
  const [end, setEnd] = useState('#000000')
  const linearGradient = `linear-gradient(to right, ${start} , ${end})`
  const tagList = [
    'gris',
    'vert',
    'bleu',
    'violet',
    'rose',
    'jaune',
    'orange',
    'fuchsia',
    'mauve',
    'rouge',
    'noir',
    'blanc',
  ]
  const [tagElList, setTagElList] = useState([])

  const handleCheck = (event) => {
    if (tagElList.some((elem) => elem === event.target.value)) {
      setTagElList(tagElList.filter((elem) => elem !== event.target.value))
    } else {
      setTagElList([...tagElList, event.target.value])
    }
  }

  const handleSubmitForm = (event) => {
    event.preventDefault()
    fetch(`https://api-gradients.herokuapp.com/gradients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: event.target.elements.name.value,
        start: event.target.elements.start.value,
        end: event.target.elements.end.value,
        tags: tagElList,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Something went wrong: ${response.textStatus}`)
        }
        return response.json()
      })
      .then((result) => {
        if (isMounted.current) {
          dispatch({ type: 'ADD_SUCCESS', payload: result })
        }
      })
      .catch((error) => {
        if (isMounted.current) {
          dispatch({ type: 'FETCH_FAILURE', payload: error.message })
        }
      })
    event.target.reset()
  }

  return (
    <form className="mb-4" onSubmit={handleSubmitForm}>
      <div className="input-group mb-4">
        <label htmlFor="name" className="input-group-text">
          Nom
        </label>
        <input
          type="text"
          className="form-control"
          id="name"
          aria-describedby="name"
          placeholder="Saisir le nom"
          required
        />
      </div>

      <div className="row">
        <div className="col-md-9 mb-4">
          <div className="input-group mb-4">
            <label htmlFor="start" className="input-group-text">
              Couleur 1
            </label>
            <input
              onChange={(e) => setStart(e.target.value)}
              value={start}
              type="color"
              className="form-control"
              id="start"
              aria-describedby="start"
              placeholder="Saisir la couleur de gauche"
              style={{ height: '2.5rem', width: '10rem' }}
            />
          </div>
          <div className="input-group">
            <label htmlFor="end" className="input-group-text">
              Couleur 2
            </label>
            <input
              onChange={(e) => setEnd(e.target.value)}
              value={end}
              type="color"
              className="form-control"
              id="end"
              aria-describedby="end"
              placeholder="Saisir la couleur de droite"
              style={{ height: '2.5rem', width: '10rem' }}
            />
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card-gradient mx-auto rounded-pill" style={{ backgroundImage: linearGradient }}></div>
        </div>
      </div>

      {tagList.map((tag) => {
        return (
          <div className="form-check form-check-inline mb-4" key={tag}>
            <input className="form-check-input" type="checkbox" id={tag} value={tag} onChange={handleCheck} />
            <label className="form-check-label" htmlFor={tag}>
              {tag}
            </label>
          </div>
        )
      })}

      <div className="text-start">
        <button type="submit" className="btn btn-outline-secondary mb-4">
          Ajouter
        </button>
        {message ? (
          <p className="alert alert-success mb-4">
            Le gradient a bien été ajouté. Veuillez réactualiser la page pour le voir apparaître dans la liste.
          </p>
        ) : (
          ''
        )}
      </div>
    </form>
  )
}

export default AddForm
