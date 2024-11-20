import React, {useState, useEffect, useHistory, useCallback, useRef, useLayoutEffect,createContext, useContext} from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet, useNavigate, NavLink, useParams,useLocation, Switch, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import apiUrl from '../../../../apiUrl';
import { jwtDecode } from 'jwt-decode';
import { useSwipeable } from 'react-swipeable';
import { motion } from 'framer-motion';
import ProfileLibrary from './ProfileLibrary.jsx';
import MobileBookProfile from './MobileProfileBooks.jsx';
import MobileProfileComment from './MobileProfileComment.jsx';


function MobileProfile() {
    const [profileData, setProfileData] = useState('');
    const [library, setLibrary] = useState(false);
    const [books, setBooks] = useState(false);
    const [comment, setComment] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchProfile = async () => {
          try {
            const decodedToken = jwtDecode(token);
            const username = decodedToken.username;
            const response = await axios.get(`${apiUrl}/users/api/${username}/`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            setProfileData(response.data);
          } catch (err) {

            console.error(err);
          } finally {

          }
        };
    
        fetchProfile();
      }, [token]);
      if (!profileData) {
        // Можно добавить индикатор загрузки, пока данные не загружены
        return <div>Loading...</div>;
    }
    const libraryOpen = () => {
      setLibrary(!library);
    }
    const booksOpen = () => {
      setBooks(!books);
    }
    const commentOpen = () => {
      setComment(!comment);
    }

    return(
        <div>
            <img className='mobile_profile__banner' src={profileData.banner_image} alt="" />
            <div className='mobile_profile__info'>
                <img className='mobile_profile__avatar' src={profileData.profileimg} alt="" />
                <div>
                    <div className='mobile_profile_name'>{profileData.user.first_name} {profileData.user.last_name}</div>
                    <div className='mobile__profile_count_cont'>
                        <div className='mobile__profile_username'>@{profileData.user.username}</div>
                        <div className='mobile__profile_coun_foll'>
                            <div className='mobile__profile_foll'>{profileData.following_count} Followings</div>
                            <div className='mobile__profile_foll'>{profileData.followers_count} Followers</div>
                        </div>
                        <div>
                            <div className='mobile__profile_books'>{profileData.books_count} Books</div>
                            <div className='mobile__profile_books'>{profileData.series_count} Series</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='mobile_profile_about_cont'>
                <div className='mobile_profile_about_view'>About</div>
                <div className='mobile_profile_about_text'>{profileData.about}</div>
            </div>
            <div>
                <button className='mobile_profile_menu_buttons' onClick={libraryOpen}>
                    <div>Library</div>
                    <div className={`button_toggle ${library ? 'open' : ''}`}></div>
                </button>
                <div className={`mobile_profile_library ${library ? 'open' : ''}`}>
                  <ProfileLibrary/>
                </div>
                <button className='mobile_profile_menu_buttons' onClick={booksOpen}>
                    <div>Books</div>
                    <div className={`button_toggle ${books ? 'open' : ''}`}></div>
                </button>
                <div className={`mobile_profile_library ${books ? 'open' : ''}`}>
                  <MobileBookProfile avatar={profileData.profileimg} username={profileData.user.username}/>
                </div>
                <button className='mobile_profile_menu_buttons' onClick={commentOpen}>
                    <div>Comment</div>
                    <div className={`button_toggle ${comment ? 'open' : ''}`}></div>
                </button>
                <div className={`mobile_profile_library ${comment ? 'open' : ''}`}>
                  <MobileProfileComment avatar={profileData.profileimg} username={profileData.user.username}/>
                </div>
            </div>
        </div>
    )
}

export default MobileProfile;