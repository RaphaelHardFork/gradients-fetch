# Projet Gradients Context

**Equipe :** Solène Christophe & Raphaël  
**Déployé sur Netlify :** https://solenemhep-gradients-fetch.netlify.app/

## [Repo de départ](https://github.com/RaphaelHardFork/gradients-project-start)

Repo du rendu du projet Alyra Gradients

## Mise en place du fetching des gradients

URL : https://api-gradients.herokuapp.com  
Cette dernière est _hardcodée_ dans `App.js`

Utilisation d'un **useReducer**:

```js
const [state, dispatch] = useReducer(fetchReducer, {
  gradientsList: [],
  uniqueTags: [],
  loaded: false,
  loading: false,
  error: "",
  filter: "Tous",
});
```

Mise en place du **useEffect** :

```js
useEffect(() => {
  dispatch({ type: "FETCH_INIT" });
  fetch(URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Something went wrong: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      if (isMounted.current) {
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      }
    })
    .catch((error) => {
      if (isMounted.current) {
        dispatch({ type: "FETCH_FAILURE", payload: error.message });
      }
    });
}, [isMounted]);
```

Et enfin de la fonction **fetchReducer** :

```js
export const gradientReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        loading: true,
        message: false,
      };
    case "FETCH_SUCCESS":
      function allTags(list) {
        let listTotal = [];
        for (let element of list) {
          if ("tags" in element) {
            listTotal = listTotal.concat(element.tags);
          }
        }
        const listTagsUnique = [];
        listTotal.forEach((el) => {
          if (!listTagsUnique.includes(el)) {
            listTagsUnique.push(el);
          }
        });
        return listTagsUnique;
      }
      return {
        ...state,
        gradients: action.payload,
        uniqueTags: allTags(action.payload),
        loading: false,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      throw new Error(`Unsupported action type ${action.type} in gradientReducer`);
  }
};
```

Pour le moment les données circulent dans l'App via les _props_.  
Les fichiers `gradients.js` et `uniqueTags.js` ont été supprimés.

Pour éviter une erreur lors du chargement de la page un fond noir est afficher par defaut dans le `<GradientHeader />`, une variable `loaded` indique si le chargement des données est fini :

```js
const backgroundImage = loaded
  ? `linear-gradient(to right, ${gradients[gradientIndex].start}, ${gradients[gradientIndex].end})`
  : "";
```

Nous utilisons cette variable plus globalement avec le **context**. En effet, à _priori_ le fetching de données est réalisé qu'une seul fois dans l'App.

## Utilisation du context pour appeler les données

Création d'un dossier `context` puis d'un fichier `GradientContext.js` :

```js
import { createContext, useReducer, useEffect } from "react";
export const GradientContext = createContext();
export const GradientContextProvider = ({ children }) => {
  return (
    <GradientContext.Provider value={{ state, dispatch }}>
      {!state.loaded ? <p>Loading...</p> : children}
    </GradientContext.Provider>
  );
};
```

On commencer par créer le context et le Component Provider, puis on ajoute le **useReducers** & le **useEffect** à l'intérieur du componentProvider :

```js
import { createContext, useReducer, useEffect } from "react";
import { fetchReducer } from "../reducers/fetchReducer";

export const GradientContext = createContext();

export const GradientContextProvider = ({ children }) => {
  const URL = "https://api-gradients.herokuapp.com/gradients";
  const [state, dispatch] = useReducer(gradientReducer, {
    gradients: [],
    uniqueTags: [],
    filter: "tous",
    message: "",
    loading: true,
    error: "",
  });

  useEffect(() => {
    dispatch({ type: "FETCH_INIT" });
    fetch(URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Something went wrong: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        if (isMounted.current) {
          dispatch({ type: "FETCH_SUCCESS", payload: data });
        }
      })
      .catch((error) => {
        if (isMounted.current) {
          dispatch({ type: "FETCH_FAILURE", payload: error.message });
        }
      });
  }, [isMounted]);

  return (
    <GradientContext.Provider value={{ state, dispatch }}>
      {!state.loaded ? <p>Loading...</p> : children}
    </GradientContext.Provider>
  );
};
```

Ensuite dans `App.js` on met en place le ComponentProvider :

```js
const App = () => {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <GradientContextProvider>
        <GradientsHeader gradients={state.gradientsList} loaded={state.loaded} />
        <GradientsApp gradients={state.gradientsList} uniqueTags={state.uniqueTags} />
        <Footer />
      </GradientContextProvider>
    </div>
  );
};
```

Puis on appelle le context via `useContext` :

```js
import { useContext } from 'react'
import { GradientContext } from '../context/gradientContext'
{...}
  const { state, dispatch } = useContext(GradientContext)
```

Nous avons modifié notre useReducer en intégrant la variable filter à l'intérieur et associés un type d'action au reducers :

```js
    case 'CHANGE_FILTER':
      return {
        ...state,
        filter: action.payload,
      }
```

Et nous définissons, dans le context, une fonction pour faire appelle à cette action :

```js
const handleChangeFilter = (e) => {
  dispatch({ type: "CHANGE_FILTER", payload: e.target.value });
};
```

## Mise dans un hook personnalisé

Pour simplifier et organiser le code, on créer un dossier `hooks` dans lequel on créer un fichier `useGradient.js`  
Puis on import le `useContext` & `GradientContext` :

```js
import { useContext } from "react";
import { GradientContext } from "../context/gradientContext";

export const useGradient = () => {
  const context = useContext(GradientContext);
  if (context === undefined) {
    throw new Error(`It seems that you are trying to use FilterContext outside of its provider`);
  }
  return context;
};
```

Puis on peut appeller le hook dans les fichiers où nous en avons besoin :

```js
import { useGradient } from "../hooks/useGradient";
{...}
const { state, dispatch } = useGradient();
```

## Gestion des erreurs et temps de chargement

Nos données ont besoin d'être chargées qu'une seul fois, on modifie donc le comportement de la variable `loading`, son état initial est fixé à `true`.

Puis toute la gestion de l'affichage du chargement et de l'erreur se fait dans le ContextComponentProvider :

```js
// /context/gradientContext.js

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
);
```

## Mise en place des Routes

Installer la dépendance :  
`yarn add react-router-dom`

`index.js` :

```js
import { BrowserRouter as Router } from 'react-router-dom'
{...}
ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
)
```

Mise en place des routes dans `App.js`:

```js
const App = () => {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <GradientContextProvider>
        <Switch>
          <Route exact path="/">
            <GradientsHeader />
            <GradientsApp />
          </Route>
          <Route exact path="/FullScreen/:id">
            <FullScreen />
          </Route>
        </Switch>
        <Footer />
      </GradientContextProvider>
    </div>
  );
};
```

Création du dossier `pages` contenant les différents Component correspondant aux pages.
On créer le style de la page correspondant à la fonction "plein écran"

Pour accèder à la page on met en place `<Link>` dans `<Gradient>` :

```js
<Link to=`/product/${id}`>Plein écran</Link>
```

Création de la page `Product.js`, on import dans le components :

```js
const { state } = useGradient();
const params = useParams();
let { id } = params;
```

Puis chaque bouton sur le plein écran est englober dans une balise `<Link>` :

```js
// Exemple

<Link to={`/fullscreen/${Number(id) + 1}`}>
  <button className="">Suivant</button>
</Link>
```

---

## Fonctionnalités supplémentaires

### Mise en place des favoris :

On définit, dans le **context**, une variable d'état `fav`, son modifier et son état initial qui regarde le **localStorage** :

```js
const [fav, setFav] = useState(JSON.parse(localStorage.getItem("favoriteGradients")) || []);
```

On définit ensuite au même niveau la fonction pour modifier ce tableau :

```js
const toggleFav = (event) => {
  if (fav.some((elem) => elem === Number(event.target.value))) {
    setFav(fav.filter((elem) => elem !== Number(event.target.value)));
  } else {
    setFav([...fav, Number(event.target.value)]);
  }
};
```

Ainsi que le useEffect pour synchroniser le tableau avec le localStorage :

```js
useEffect(() => {
  localStorage.setItem("favoriteGradients", JSON.stringify(fav));
}, [fav]);
```

### Ajout de gradients dans l'API

Nous avons recréer une API à l'aide de Heroku afin de pouvoir la modifier (faire des POST notamment).

Un component `<AddForm />` est ajouté, dans lequel une fonction **handleSubmitForm** est mis en place pour modifer l'API :

```js
const handleSubmitForm = (event) => {
  event.preventDefault();
  fetch(`https://api-gradients.herokuapp.com/gradients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({...}),
  })
    .then((response) => {...})
    .then((result) => {...})
    .catch((error) => {...});
  event.target.reset();
};
```

Une fois le formulaire envoyer, l'utilisateur à besoin d'actualiser la page pour voir apparaitre son gradients.

### Ajout d'un Dark Mode

Un nouveau context est crée, `GlobalSettingContext.js`, puis on met en place dans le Provider Component :

```js
const [darkMode, setDarkMode] = useState(JSON.parse(localStorage.getItem("dark-mode")) || true);

useEffect(() => {
  localStorage.setItem("dark-mode", JSON.stringify(darkMode));
}, [darkMode]);
```

### Ajout d'un changement de langue

De même que pour le Dark Mode on met en place ce mode via une variable d'état :

```js
const [lang, setLang] = useState(JSON.parse(localStorage.getItem("lang")) || "en");

useEffect(() => {
  localStorage.setItem("lang", JSON.stringify(lang));
}, [lang]);

const langMessages = {
  en: {
    tagline: "Ultimate collection of the most beautiful shades",
    add: "Add",
    full: "fullscreen",
    filter: "Filter by tag",
    name: "Name",
    placeholder: "Fill in the name",
    color1: "Color 1",
    color2: "Color 2",
    addTitle: "Add a gradient",
    message: "Gradient has been added. Please refresh page to display it in list.",
  },
  fr: {
    tagline: "Ultime collection de plus beaux dégradés",
    add: "Ajouter",
    full: "plein écran",
    filter: "Filtrer par tag",
    name: "Nom",
    placeholder: "Saisir le nom",
    color1: "Couleur 1",
    color2: "Couleur 2",
    addTitle: "Ajouter un gradient",
    message: "Le gradient a bien été ajouté. Veuillez réactualiser la page pour le voir apparaître dans la liste.",
  },
};
```

`GlobalSettingContext` est intégrer dans un hook personnalisé :

```js
import { useContext } from "react";
import { GlobalSettingsContext } from "../context/GlobalSettingsContext";

export const useGlobalSettings = () => {
  const context = useContext(GlobalSettingsContext);
  if (context === undefined) {
    throw new Error(`It seems that you are trying to use GlobalSettingsContext outside of its provider`);
  }
  return context;
};
```
