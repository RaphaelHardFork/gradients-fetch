export const gradientReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        loading: true,
        message: false,
      }
    case 'FETCH_SUCCESS':
      function allTags(list) {
        let listTotal = []
        for (let element of list) {
          if ('tags' in element) {
            listTotal = listTotal.concat(element.tags)
          }
        }
        const listTagsUnique = []
        listTotal.forEach((el) => {
          if (!listTagsUnique.includes(el)) {
            //listTagsUnique = listTagsUnique.concat([el])
            listTagsUnique.push(el)
          }
        })
        return listTagsUnique
      }
      return {
        ...state,
        gradients: action.payload,
        uniqueTags: allTags(action.payload),
        loading: false,
      }
    case 'FETCH_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    case 'CHANGE_FILTER':
      return {
        ...state,
        filter: action.payload,
      }
    case 'ACTUALISATION':
      return {
        ...state,
        actualisation: state.actualisation + 1,
      }

    case 'ADD_SUCCESS':
      return {
        ...state,
        loading: false,
        message: true,
      }
    default:
      throw new Error(`Unsupported action type ${action.type} in gradientReducer`)
  }
}
