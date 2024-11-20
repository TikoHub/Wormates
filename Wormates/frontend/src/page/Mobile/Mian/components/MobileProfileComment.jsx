import React, {useState, useEffect, useHistory, useCallback, useRef, useLayoutEffect,createContext, useContext} from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet, useNavigate, NavLink, useParams,useLocation, Switch, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import apiUrl from '../../../../apiUrl';
import { jwtDecode } from 'jwt-decode';


function MobileProfileComment({avatar, username}) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

  
    useEffect(() => {
        const fetchComments = async () => {
          try {
            const token = localStorage.getItem('token');
            const decodedToken = jwtDecode(token);
            const username = decodedToken.username;
            const response = await axios.get(`${apiUrl}/users/api/${username}/comments/`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            console.log('API Response:', response.data); // Посмотри структуру данных
            setComments(response.data.comments); 
          } catch (err) {
            console.error('Error fetching comments:', err);
            setError('Не удалось загрузить комментарии');
          } finally {
            setLoading(false);
          }
        };
      
        fetchComments();
      }, []);
  
    return(
        <div className='mobile_profile__comment'>

                      {comments.map((comment) => (
            <div className='mobile_profile__comment_item'>
                <div className='mobile_profile__commen_info'>
                    <img className='mobile_profile__comment_avatar'src={avatar} alt="" />
                    <div className='mobile_profile__comment_username'>{username}</div>
                    <div className='mobile_profile__comment_date'>{comment.formatted_timestamp}</div>
                    <div className='mobile_profile__comment_books'>For the book:{comment.book_name}</div>
                </div>
                <div className='mobile_profile__comment_text'>{comment.text}</div>
                <div>
                    <div className='mobile_profile__comment_reply'>Reply</div>
                    <div>
                        <div></div>
                        <div>{}</div>
                        <div></div>
                    </div>
                </div>
            </div>
                      ))}
        </div>
    )
}

export default MobileProfileComment;