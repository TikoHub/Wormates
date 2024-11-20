import React, {useState, useEffect, useHistory, useCallback, useRef, useLayoutEffect,createContext, useContext} from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet, useNavigate, NavLink, useParams,useLocation, Switch, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import apiUrl from '../../../../apiUrl';
import { jwtDecode } from 'jwt-decode';


function ProfileLibrary() {
    const [activeTab, setActiveTab] = useState('All');
    const [books, setBooks] = useState([]);
    const token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token);
    const username = decodedToken.username;
  
    useEffect(() => {
      const fetchBooks = async () => {
        try {
          // Получаем токен из localStorage или любого другого места, где он хранится
          const token = localStorage.getItem('token');
    
          if (!token) {
            console.error('Токен не найден');
            return;
          }
    
          // Добавляем токен к заголовку Authorization
          const config = {
            headers: {
              Authorization: `Bearer ${token}`
            }
          };
    
          const response = await axios.get(`${apiUrl}/users/api/${username}/library?filter_by=${activeTab}`, config);
          const fetchedBooks = response.data;
    
          if (Array.isArray(fetchedBooks)) {
            setBooks(fetchedBooks);
          } else {
            console.error('Данные не являются массивом:', fetchedBooks);
          }
        } catch (error) {
          console.error('Ошибка при получении книг', error);
        }
      };
    
      fetchBooks();
    
    }, [activeTab, username]);

    
    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };
    return(
        <div className='profile_library_container'>
            <ul className="library_log_nav">
                <li className={`library_log_li ${activeTab === 'all' ? 'active' : ''}`} onClick={() => handleTabClick('all')}>All</li>
                <li className={`library_log_li ${activeTab === 'reading' ? 'active' : ''}`} onClick={() => handleTabClick('reading')}>Reading</li>
                <li className={`library_log_li ${activeTab === 'liked' ? 'active' : ''}`} onClick={() => handleTabClick('liked')}>Liked</li>
                <li className={`library_log_li ${activeTab === 'wish_list' ? 'active' : ''}`} onClick={() => handleTabClick('wish_list')}>Wish List</li>
                <li className={`library_log_li ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => handleTabClick('favorites')}>Favorites</li>
                <li className={`library_log_li ${activeTab === 'finished' ? 'active' : ''}`} onClick={() => handleTabClick('finished')}>Finished</li>
            </ul>
            {books.map((book) => (
          <div className='profile_library_item_mobile' key={book.id}>
            <div className='profile_library__item_content'>
              <a href={`book_detail/${book.id}`}><div className='profile_library_item-coverpage_mobile'><img src={book.coverpage} alt={book.name} /></div></a>
              <a href={`book_detail/${book.id}`}><div className='profile_library_book_name_mobile'>{book.name}</div></a>
              <a href={`/author/${book.author}`} className='profile_library_book_author'>{book.author}</a>
            </div>
          </div>
        ))}
        </div>
    )
}


export default ProfileLibrary;