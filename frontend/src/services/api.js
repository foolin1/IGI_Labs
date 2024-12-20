export async function validate() {
    const token = localStorage.getItem('jwt')
    if (!token) {
      return false;
    }
  
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_DOMAIN}/Validate`,
      {
        headers: {
          method: 'GET',
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
        console.error("Failed to validate user")
        return false;
    }
    
    return (await response.json()).isAuthenticated
} 

export async function getAutos(id = null) {
  const token = localStorage.getItem('jwt')
  if (!token) {
    console.error("Invalid token")
    return;
  }
  const url = `${process.env.REACT_APP_BACKEND_DOMAIN}/Autos`

  if (id) {
    url += `?id=${id}`
  }

  const response = await fetch(
    url,
    {
      headers: {
        method: 'GET',
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    console.error(await response.json())
    throw new Error((await response.json()).error)
  }
  
  return await response.json()
} 

// Функция для добавления нового автомобиля
export async function addAuto(autoData) {
  const token = localStorage.getItem('jwt');
  if (!token) {
    console.error("Invalid token");
    return;
  }

  const url = `${process.env.REACT_APP_BACKEND_DOMAIN}/Autos`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(autoData),
  });

  if (!response.ok) {
    console.error(await response.json());
    throw new Error('Ошибка при добавлении автомобиля');
  }

  return await response.json();
}

// Функция для обновления автомобиля
export async function updateAuto(id, autoData) {
  const token = localStorage.getItem('jwt');
  if (!token) {
    console.error("Invalid token");
    return;
  }

  const url = `${process.env.REACT_APP_BACKEND_DOMAIN}/Autos`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...autoData, _id: id }),
  });

  if (!response.ok) {
    console.error(await response.json());
    throw new Error('Ошибка при обновлении автомобиля');
  }

  return await response.json();
}

// Функция для удаления автомобиля
export async function deleteAuto(id) {
  const token = localStorage.getItem('jwt');
  if (!token) {
    console.error("Invalid token");
    return;
  }

  const url = `${process.env.REACT_APP_BACKEND_DOMAIN}/Autos?id=${id}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    console.error(await response.json());
    throw new Error('Ошибка при удалении автомобиля');
  }

  return await response.json();
}


export async function login(username, password) {
  const url = `${process.env.REACT_APP_BACKEND_DOMAIN}/login`

  const response = await fetch(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password
      })
    }
  )

  if (!response.ok) {
    throw new Error((await response.json()).error)
  }
  
  return await response.json()
} 

export async function register(username, password) {
  const url = `${process.env.REACT_APP_BACKEND_DOMAIN}/register`

  const response = await fetch(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password
      })
    }
  )

  if (!response.ok) {
    throw new Error((await response.json()).error)
  }
  
  return await response.json()
} 

export async function getNews() {
  const url = `${process.env.REACT_APP_BACKEND_DOMAIN}/News`

  const response = await fetch(
    url,
    {
      headers: {
        method: 'GET',
      },
    }
  )

  if (!response.ok) {
    console.error(await response.json())
    throw new Error((await response.json()).error)
  }
  
  return await response.json()
} 

export async function getParkingSpots() {
  const url = `${process.env.REACT_APP_BACKEND_DOMAIN}/ParkingSpots`
  
  const response = await fetch(
    url,
    {
      headers: {
        method: 'GET',
      },
    }
  )

  if (!response.ok) {
    console.error(await response.json())
    throw new Error((await response.json()).error)
  }
  
  return await response.json()
} 

export const fetchCatImage = async () => {
  try {
    const response = await fetch("https://api.thecatapi.com/v1/images/search");
    if (response.ok) {
      const data = await response.json();
      return data[0].url;  // URL изображения кошки
    } else {
      throw new Error(`Failed to retrieve cat image. Status code: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching cat image:", error);
    return null;
  }
};

export const fetchJoke = async () => {
  try {
    const response = await fetch("https://v2.jokeapi.dev/joke/Any");
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`Failed to retrieve joke. Status code: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching joke:", error);
    return null;
  }
};