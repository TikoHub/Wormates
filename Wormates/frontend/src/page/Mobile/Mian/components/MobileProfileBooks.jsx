import React, {useState, useEffect, useHistory, useCallback, useRef, useLayoutEffect,createContext, useContext} from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet, useNavigate, NavLink, useParams,useLocation, Switch, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import apiUrl from '../../../../apiUrl';
import { jwtDecode } from 'jwt-decode';


function MobileBookProfile({avatar, username}) {
    const [series, setSeries] = useState([]);
    const [selectedSeries, setSelectedSeries] = useState(null);
    const token = localStorage.getItem('token'); // Заменить на свой способ получения токена

    useEffect(() => {
      const decodedToken = jwtDecode(token);
      const username = decodedToken.username;
      axios.get(`${apiUrl}/users/api/${username}/series/`, {
        headers: {
          Authorization: `Bearer ${token}` // Передаём токен в заголовке
        }
      })
      .then(response => setSeries(response.data))
      .catch(error => console.error('Error fetching series:', error));
    }, [ token]); 
  
    const handleSeriesClick = (seriesId) => {
        const selected = series.find(seriesItem => seriesItem.id === seriesId);
        console.log(selected);  // Выводим данные серии в консоль
        setSelectedSeries(selected);
      };
    return(
        <div className="mobile_book__series_list">
        <div className="mobile_book__series_container">
            <div className="mobile_book__series_button_cont">
                {series.map((seriesItem) => (
                    <button className="mobile_book__series_button" key={seriesItem.id} onClick={() => handleSeriesClick(seriesItem.id)}>
                        {seriesItem.name}
                    </button>
                ))}
            </div>
            {selectedSeries && selectedSeries.books.length > 0 && (
        <div className="mobile_book__series_books_list">
          <div className="mobile_book__series_books_list">
          {selectedSeries && selectedSeries.books && selectedSeries.books.length > 0 ? (
  <div className="mobile_book__series_books_list">
    {selectedSeries.books.map((book) => (
      <div className="mobile_book__series_item" key={book.id}>
        <div className="mobile_book__series_item_info">
            <img  className="mobile_book__series_item_coverpage" src={book.coverpage} alt="" />
            <div  className="mobile_book__series_item_bookname">{book.name}</div>
            <div  className="mobile_book__series_item_by">by</div>
            <img className="mobile_book__series_item_avatar" src={avatar} alt="" />
            <div className="mobile_book__series_item_username">{username}</div>
        </div>
        <div className="mobile_book__series_item_about_cont">
            <div className="mobile_book__series_item_about">About book</div>
            <div  className="mobile_book__series_item_text">{book.description}</div>
        </div>
      </div>
    ))}
  </div>
) : (
  <p>Нет доступных книг в этой серии.</p>
)}
          </div>
        </div>
      )}
    </div>
        </div>
    )
}


export default MobileBookProfile;