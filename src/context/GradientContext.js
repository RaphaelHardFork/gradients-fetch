import { createContext, useReducer, useEffect, useState, Fragment } from 'react'
import { gradientReducer } from '../reducer/gradientReducer'
import { useIsMounted } from '../hook/useIsMounted'

export const GradientContext = createContext()

export const GradientContextProvider = ({ children }) => {
  const isMounted = useIsMounted()
  // FETCH
  const URL = 'https://api-gradients.herokuapp.com/gradients'
  const [state, dispatch] = useReducer(gradientReducer, {
    gradients: [],
    uniqueTags: [],
    filter: 'tous',
    message: '',
    loading: true,
    error: '',
  })
  const { gradients, uniqueTags, loading, error, message, filter } = state

  useEffect(() => {
    dispatch({ type: 'FETCH_INIT' })
    fetch(URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Something went wrong: ${response.statusText}`)
        }
        return response.json()
      })
      .then((data) => {
        if (isMounted.current) {
          dispatch({ type: 'FETCH_SUCCESS', payload: data })
        }
      })
      .catch((error) => {
        if (isMounted.current) {
          dispatch({ type: 'FETCH_FAILURE', payload: error.message })
        }
      })
  }, [isMounted])

  // FILTER
  const handleChangeFilter = (e) => {
    dispatch({ type: 'CHANGE_FILTER', payload: e.target.value })
  }

  // FAVORITE
  const [fav, setFav] = useState(JSON.parse(localStorage.getItem('favoriteGradients')) || [])
  const toggleFav = (event) => {
    if (fav.some((elem) => elem === Number(event.target.value))) {
      setFav(fav.filter((elem) => elem !== Number(event.target.value)))
    } else {
      setFav([...fav, Number(event.target.value)])
    }
  }
  useEffect(() => {
    localStorage.setItem('favoriteGradients', JSON.stringify(fav))
  }, [fav])

  // ADDING

  return (
    <Fragment>
      {error ? (
        <p>error...</p>
      ) : (
        <GradientContext.Provider
          value={{ gradients, uniqueTags, message, dispatch, handleChangeFilter, filter, fav, toggleFav }}
        >
          {loading ? <p>loading...</p> : children}
        </GradientContext.Provider>
      )}
    </Fragment>
  )
}
