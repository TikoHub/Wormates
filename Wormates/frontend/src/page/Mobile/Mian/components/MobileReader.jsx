import React, {useState, useEffect, useHistory, useCallback, useRef, useLayoutEffect,createContext, useContext} from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet, useNavigate, NavLink, useParams,useLocation, Switch, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import apiUrl from '../../../../apiUrl';
import { jwtDecode } from 'jwt-decode';
import { useSwipeable } from 'react-swipeable';
import { motion } from 'framer-motion';



function MobileReader(){
    const [chapterList, setChapterList] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettings] = useState('');
    const [chapters, setChapters] = useState([]);
    const [content, setContent] = useState('');
    const token = localStorage.getItem('token');
    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState('');
    const { book_id } = useParams();
    const[vertically, setVertically] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState('style_sepia');
    const settingsRef = useRef(null);
    const [font, setFont] = useState('Roboto');
    const [fontSize, setFontSize] = useState(16);
    const [fontWeight, setFontWeight] = useState(400);
    const [lineHeight, setLineHeight] = useState(1.5);
    const [textAlign, setTextAlign] = useState('left');
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
    const [currentPages, setCurrentPages] = useState([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const contentRef = useRef(null);
    const [showHeader, setShowHeader] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [scrollDelta, setScrollDelta] = useState(0);
    const scrollThreshold = 50; // Порог в пикселях для изменения видимости header
    const [isChapterChanging, setIsChapterChanging] = useState(false);
    

    useEffect(() => {
        const handleScroll = () => {
            // Проверка: если меню глав открыто, выходим из функции
            if (chapterList) {
                return;
            }
    
            const currentScrollY = window.scrollY;
            const newScrollDelta = lastScrollY - currentScrollY;
            const threshold = 2;
    
            if (isChapterChanging) {
                return;
            }
    
            if (newScrollDelta > threshold) {
                setShowHeader(true);
            } else if (newScrollDelta < -threshold) {
                setShowHeader(false);
            }
    
            setLastScrollY(currentScrollY);
        };
    
        window.addEventListener('scroll', handleScroll);
    
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY, isChapterChanging, chapterList]);

    const increaseLineHeight = () => {
        setLineHeight(prev => prev + 0.1); // увеличиваем высоту на 0.1
    };

    // Функция для уменьшения высоты строки
    const decreaseLineHeight = () => {
        setLineHeight(prev => Math.max(prev - 0.1, 1)); // уменьшаем, но не ниже 1
    };

    // Обработчик для открытия главы
    const openChapter = (chapterIndex) => {

        const firstPageOfChapter = pages.findIndex(
            (page) => page.chapterIndex === chapterIndex && page.pageIndex === 0
        );
    
        // Если глава найдена, перемещаемся на её первую страницу
        if (firstPageOfChapter !== -1) {
            setCurrentPage(firstPageOfChapter);
        }
        
        setChapterList(false);
    };
    
    const handleTextAlignChange = (event) => {
        setTextAlign(event.target.value);
    };

    useEffect(() => {
        const fetchChapters = async () => {
          try {
            const response = await axios.get(`${apiUrl}/api/book/${book_id}/chapter_side/`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            setChapters(response.data);
          } catch (err) {
            console.error('Error fetching chapters:', err);
          } finally {
            setIsLoading(false);
        }
        };
    
        fetchChapters();
      }, [apiUrl, book_id, token]);

    

      const handleNextChapter = () => {
        if (currentChapterIndex < chapters.length - 1) {
          setIsChapterChanging(true);
          setCurrentChapterIndex(currentChapterIndex + 1);
          setCurrentPageIndex(0); // Сбрасываем на первую страницу
          setIsChapterChanging(false);
        }
      };
      
      const handlePreviousChapter = () => {
        if (currentChapterIndex > 0) {
          setIsChapterChanging(true);
          setCurrentChapterIndex(currentChapterIndex - 1);
          setCurrentPageIndex(0);
          setIsChapterChanging(false); // Сбрасываем на первую страницу
        }
      };
      useEffect(() => {
        // Прокручиваем к началу содержимого при смене главы
        if (contentRef.current) {
          contentRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, [currentChapterIndex]);
    
    const openChapters = () => {
        setChapterList(!chapterList);
      };
      
      const openSettings = () => {
        setSettings(prev => !prev);
    };
    const handleClickOutside = (event) => {
        if (settingsRef.current && !settingsRef.current.contains(event.target)) {
            setSettings(false); 
        }
    };

    useEffect(() => {

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const handleStyleChange = (event) => {
        setSelectedStyle(event.target.value); // Изменение выбранного стиля
    };
    const handleFontChange = (event) => {
        setFont(event.target.value);
    };
    const increaseFontSize = () => {
        setFontSize(prevSize => prevSize + 2); // Увеличиваем размер шрифта на 2
    };

    const decreaseFontSize = () => {
        setFontSize(prevSize => Math.max(prevSize - 2, 10)); // Уменьшаем размер шрифта на 2, минимально 10
    };
    const handleWeightChange = (event) => {
        setFontWeight(event.target.value); // Изменяем вес шрифта в зависимости от ползунка
    };
    const handleDoubleTap = () => {
        if (isAnimating) return; // Игнорируем, если анимация в процессе
        setIsAnimating(true);
        setIsHeaderVisible(prev => !prev);
        
        // Ждем окончания анимации перед сбросом состояния
        setTimeout(() => {
            setIsAnimating(false);
        }, 500); // Должно соответствовать времени анимации в CSS
    };
    const handleChapterClick = (index) => {
        setCurrentChapterIndex(index);
        setChapterList(false);

      };
    
    // Обработчик события нажатия
    const handleTouchEnd = (event) => {
        const currentTime = new Date().getTime();
        const tapTimeout = 300; // Время ожидания для двойного нажатия (в миллисекундах)
        let lastTap = event.target.getAttribute('data-last-tap');

        if (lastTap && currentTime - lastTap < tapTimeout) {
            handleDoubleTap(); // Вызываем функцию при двойном нажатии
        }

        event.target.setAttribute('data-last-tap', currentTime); // Сохраняем время последнего нажатия
    };
    useEffect(() => {
      if (chapters.length > 0) {
          const content = chapters[currentChapterIndex].content;
          const words = content.split(' ');
          let currentPage = [];
          const tempPages = [];
  
          // Создаем элемент для расчета высоты
          const tempDiv = document.createElement('div');
          document.body.appendChild(tempDiv);
          tempDiv.style.position = 'absolute';
          tempDiv.style.visibility = 'hidden';
          tempDiv.style.whiteSpace = 'pre-wrap';
          tempDiv.style.width = '100%'; // Устанавливаем ширину, чтобы соответствовать контейнеру
  
          words.forEach((word) => {
              currentPage.push(word);
              tempDiv.innerText = currentPage.join(' ');
  
              // Проверяем высоту, устанавливая лимит в 90% высоты экрана
              if (tempDiv.clientHeight > window.innerHeight * 0.9) {
                  // Проверяем, есть ли точка для завершения страницы
                  let pageText = currentPage.join(' ');
                  if (!pageText.endsWith('.')) {
                      // Если не оканчивается на точку, ищем последнее предложение
                      const lastDotIndex = pageText.lastIndexOf('.');
                      if (lastDotIndex !== -1) {
                          pageText = pageText.substring(0, lastDotIndex + 1);
                          currentPage = currentPage.slice(lastDotIndex + 1);
                      } else {
                          currentPage = [];
                      }
                  } else {
                      currentPage = [word];
                  }
                  
                  tempPages.push(pageText);
              }
          });
  
          if (currentPage.length > 0) {
              tempPages.push(currentPage.join(' '));
          }
  
          setPages(tempPages);
          setCurrentPageIndex(0); // Сбрасываем страницу при смене главы
  
          document.body.removeChild(tempDiv); // Убираем временный элемент
      }
  }, [chapters, currentChapterIndex]);
    return(
        <div className={`reader_mobile ${selectedStyle}`}  >
                      {isLoading ? (
                <div className="reader_mobile__loader">
<svg className="reader_mobile__loading_logo"  width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill='white'>
<g clip-path="url(#clip0_309_961)">
<path d="M35.9632 5.50044C35.9074 5.69934 35.8329 5.82518 35.9558 5.56133C35.9856 5.50044 36.1121 5.32589 36.1121 5.27312C36.1121 5.36648 35.7883 5.65469 36.0116 5.44361C36.0861 5.3746 36.3728 5.08233 36.0489 5.38678C35.6505 5.76023 36.1196 5.3543 36.1159 5.36242C36.0973 5.41925 35.5165 5.67498 35.8515 5.52885C35.967 5.47608 36.3541 5.31371 35.859 5.5045C35.3638 5.69528 35.7064 5.56539 35.818 5.53291C36.3392 5.38272 35.5277 5.57351 35.5277 5.58162C35.5351 5.55321 35.8143 5.55321 35.8404 5.54915C36.1308 5.50856 35.2187 5.52073 35.5016 5.54915C35.5947 5.55727 35.6915 5.55727 35.7883 5.56539C35.8851 5.5735 35.9744 5.5938 36.0675 5.60192C36.3281 5.61816 35.5388 5.45579 35.7845 5.54915C35.9558 5.6141 36.1419 5.65469 36.3169 5.71964C36.3914 5.74805 36.652 5.86577 36.3169 5.71152C35.967 5.55321 36.2834 5.7034 36.3616 5.74399C36.5105 5.82518 36.652 5.91854 36.7934 6.01596C36.9349 6.11339 37.0652 6.22704 37.203 6.33664C37.5082 6.58426 36.9796 6.08903 37.1285 6.26764C37.1918 6.34476 37.27 6.40971 37.3333 6.48278C37.8619 7.05513 38.2863 7.72897 38.6325 8.44746L38.4203 8.00095C38.9751 9.19031 39.2915 10.4812 39.3511 11.8167L39.3325 11.3174C39.3548 12.0521 39.2915 12.7746 39.1538 13.4972C39.0756 13.9153 38.9788 14.3293 38.8708 14.7393C38.815 14.9504 38.7554 15.1574 38.6921 15.3645C38.6623 15.47 38.6288 15.5715 38.5953 15.677C38.4799 16.0545 38.6661 15.4822 38.5842 15.7217C37.9922 17.4063 37.2811 19.03 36.5366 20.6415C35.9148 21.9892 35.2857 23.3328 34.7682 24.7332C34.1651 26.3772 33.6178 28.0497 33.1189 29.7383C31.1346 36.4564 29.7795 43.5642 29.6306 50.6354C29.5673 53.6149 29.3328 58.0882 32.3781 59.5008C34.7942 60.6212 37.5827 59.2004 39.124 57.1018C39.6601 56.3711 40.1217 55.5958 40.5424 54.7799C41.5736 52.7665 42.4374 50.6516 43.2973 48.5489C44.3025 46.0931 45.2705 43.621 46.2757 41.1611C47.1319 39.0665 47.9919 36.9557 49.0157 34.9504C49.2093 34.5729 49.4066 34.1994 49.6188 33.8382C49.7007 33.6961 49.7901 33.5581 49.8757 33.4201C50.0916 33.075 49.805 33.5987 49.7082 33.6555C49.7603 33.6271 49.8124 33.5094 49.8534 33.4566C50.0842 33.144 50.3299 32.8436 50.5905 32.5595C50.7059 32.4296 50.8474 32.3119 50.9591 32.1779C50.6091 32.6123 50.6612 32.4377 50.8139 32.32C50.8288 32.3078 51.1527 32.048 51.1601 32.0602C51.1638 32.0643 50.5347 32.4255 50.9218 32.2185C51.108 32.117 51.3909 32.0886 50.5979 32.3362C50.7022 32.3038 50.9553 32.251 50.49 32.3484C49.7715 32.4945 50.8325 32.3728 50.181 32.389C49.5295 32.4052 50.6352 32.5108 49.8348 32.3565C49.3396 32.2632 49.5071 32.2835 49.6077 32.3159C49.8534 32.3971 48.9934 31.9953 49.2614 32.1536C49.4662 32.2794 49.2428 32.3281 49.0194 31.9141C49.0418 31.9547 49.0902 31.9831 49.1162 32.0237C49.1758 32.117 49.2354 32.2023 49.2838 32.2997L49.0716 31.8532C49.4327 32.6204 49.4774 33.5581 49.5146 34.4024L49.496 33.9031C49.6188 37.049 49.2279 40.195 49.1609 43.3409C49.1348 44.6277 49.0641 46.0484 49.4066 47.2946C50.0954 49.7951 52.8168 49.6206 54.6373 48.7478C56.1004 48.0497 57.3215 46.7669 58.4458 45.5573C59.5701 44.3476 60.5455 43.1948 61.5544 41.9729C64.2982 38.6403 66.8819 35.1493 69.3055 31.5366C71.5057 28.2567 73.6836 24.8063 75.1318 21.0434C75.3254 20.54 75.4967 20.0285 75.6642 19.5171C75.8318 19.0056 75.3887 18.4536 75.0537 18.2262C74.5622 17.8893 73.799 17.8041 73.2406 17.8812C71.9413 18.0557 70.6867 18.6971 70.2288 20.0935C70.4745 19.3466 70.1878 20.195 70.1171 20.3858C70.0203 20.6496 69.9161 20.9094 69.8118 21.1651C69.5922 21.701 69.3539 22.2287 69.1045 22.7523C68.5609 23.893 67.9653 25.0011 67.3435 26.089C66.6511 27.2946 65.9251 28.4759 65.1731 29.6409C64.7859 30.2417 64.3913 30.8384 63.9892 31.431C63.8924 31.5772 63.7919 31.7192 63.6951 31.8654C63.643 31.9425 63.3377 32.3849 63.5648 32.0561C63.7919 31.7273 63.4419 32.2348 63.3973 32.2997C63.2856 32.4621 63.1739 32.6204 63.0585 32.7828C60.2626 36.7527 57.288 40.6456 54.0156 44.1649C53.7326 44.4694 53.4422 44.7738 53.1481 45.0661C53.029 45.1838 52.9099 45.2975 52.7907 45.4152C52.4668 45.7278 53.3008 44.9606 53.07 45.1595C53.0141 45.2082 52.962 45.2569 52.9061 45.3056C52.787 45.4071 52.6642 45.5086 52.5413 45.606C52.4594 45.6709 52.37 45.7278 52.2881 45.7968C52.0499 45.9957 52.8503 45.5694 52.4259 45.7156C52.4557 45.7075 53.1444 45.5086 52.7051 45.606C53.0513 45.5289 53.23 45.5004 53.539 45.4964C54.0826 45.4923 53.9262 45.4964 53.8071 45.4923C53.5763 45.4761 54.5628 45.6709 54.3208 45.5938C54.0379 45.5004 54.9165 45.9429 54.6745 45.7562C54.4958 45.6222 54.991 46.1621 54.924 45.9916C54.8867 45.8982 54.7862 45.8049 54.7378 45.7075L54.95 46.154C54.641 45.4923 54.6112 44.6764 54.5814 43.9457L54.6001 44.445C54.4847 41.3072 54.8867 38.1694 54.9426 35.0356C54.9649 33.6677 55.017 32.1779 54.6634 30.8465C54.5331 30.3472 54.3208 29.8114 53.9746 29.4501C52.8652 28.2892 51.1117 28.3703 49.7231 28.7884C45.7209 29.99 43.8297 34.4633 42.2289 38.2141C40.6131 41.9973 39.1575 45.8577 37.5678 49.6531C36.9014 51.2402 36.2238 52.8315 35.442 54.3577C35.1628 54.9057 34.8575 55.4253 34.5336 55.9409C34.8017 55.5106 34.8426 55.5106 34.6267 55.7947C34.422 56.0667 34.1986 56.3103 33.9789 56.566C33.7965 56.773 34.1874 56.3711 34.1762 56.3833C34.1018 56.4442 33.871 56.5863 34.2321 56.363C34.422 56.2453 34.6304 56.1519 34.8426 56.0911C34.7682 56.1114 35.5425 55.9815 35.2708 56.0058C34.999 56.0302 35.7734 56.0058 35.6952 56.0058C35.6058 56.0058 35.3899 55.9571 35.8031 56.0342C36.2164 56.1114 36.0116 56.0748 35.9186 56.0423C35.9632 56.0586 36.3839 56.3184 36.1605 56.1479C36.101 56.1032 35.7548 55.8313 36.0228 56.0667C36.276 56.2859 36.0079 56.0261 35.9521 55.9571C35.7957 55.7541 35.6654 55.5309 35.5463 55.2995L35.7585 55.746C35.2596 54.6987 35.1181 53.5703 35.066 52.4052L35.0846 52.9045C34.9171 48.7154 35.3341 44.5019 36.0005 40.3776C36.6929 36.0992 37.6832 31.8694 38.9788 27.7614C39.057 27.5179 39.1351 27.2784 39.2133 27.0348C39.3287 26.6817 39.2059 27.0511 39.1873 27.112C39.2319 26.9699 39.2803 26.8278 39.3287 26.6898C39.4851 26.2311 39.6452 25.7724 39.8127 25.3137C40.118 24.4775 40.453 23.6616 40.8179 22.8538C41.6667 20.9744 42.5714 19.1193 43.3085 17.183C44.0456 15.2467 44.8051 13.0507 44.7604 10.883C44.7195 8.87369 44.2318 7.0186 43.2341 5.31371C42.0688 3.32467 40.2036 2.09065 38.0816 1.74968C35.1554 1.2788 31.4474 2.80509 30.5166 6.08903C30.3752 6.59238 30.7735 7.14038 31.1272 7.37988C31.6186 7.7168 32.3818 7.80204 32.9402 7.72492C34.1911 7.55849 35.5537 6.91712 35.9521 5.51261L35.9632 5.50044Z" />
<path d="M37.5193 12.1638C39.3716 8.28416 39.0325 4.09428 36.7619 2.80548C34.4913 1.51668 31.149 3.61701 29.2967 7.49669C27.4444 11.3764 27.7836 15.5663 30.0542 16.8551C32.3248 18.1439 35.667 16.0435 37.5193 12.1638Z"  stroke="none" stroke-miterlimit="10"/>
<path d="M76.0353 36.3825C75.7599 35.2296 77.141 32.8387 78.5669 31.6859C80.1343 30.4194 82.234 31.0486 82.878 32.4206C83.5221 33.7967 82.6025 35.6234 80.9012 36.6625C79.1923 37.7058 76.4002 37.9047 76.0353 36.3825Z"  stroke="#none" stroke-miterlimit="10"/>
</g>
</svg> 
<div className="loading-bar"></div>
<div className='loading-views'>Loading...</div>
                </div>
            ) : (
            <div>
              <header className={`reader_mobile__header ${showHeader ? '' : 'hidden'}`}>
                <div className='reader__mobile__buttons'>
                    <Link to={`/book_detail/${book_id}`}><button className='reader_mobile__back_manu'>
                    <svg className='svg_reader_mobile' fill="#000000" width="40px" height="40px" viewBox="-8.5 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.281 7.188v17.594l-15.281-8.781z"></path>
                    </svg>
                    </button></Link>
                    <div className='reader_mobile__info'>
                {chapters.length > 0 && (
          <div className='reader_mobile__info_stats'>Глава: {chapters[currentChapterIndex].title}</div>
        )}
                    <div className='reader_mobile__info_stats'> Page: {currentPage + 1} of  {pages.length}</div>
                </div>
                    <div className='reader_mobile__menu'>
                        <button  className='reader_mobile__chapters_menu' onClick={openChapters}>
                        <svg className='svg_reader_mobile'fill="#000000" width="40px" height="40px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <g data-name="Layer 2">
                        <g data-name="menu-2">
                        <rect width="24" height="24" transform="rotate(180 12 12)" opacity="0"/>
                        <circle cx="4" cy="12" r="1"/>
                        <rect x="7" y="11" width="14" height="2" rx=".94" ry=".94"/>
                        <rect x="3" y="16" width="18" height="2" rx=".94" ry=".94"/>
                        <rect x="3" y="6" width="18" height="2" rx=".94" ry=".94"/>
                        </g>
                        </g>
                        </svg>
                        </button>
                        {chapterList && (
                            <div className='reader_mobile__chapters_list'>
                                <div className='reader_mobile__chapters_list_menu'>
                                    <button className='reader_mobile__back_manu' onClick={openChapters}>
                                        <svg className='svg_reader_mobile'fill="#000000" width="40px" height="40px" viewBox="-8.5 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15.281 7.188v17.594l-15.281-8.781z"></path>
                                        </svg>
                                    </button>
                                </div>
                                <ul className='reader_mobile__chapters_ul'>
                                    {chapters.map((chapter, index) => (
                                    <button className='reader_mobile__chapter'  onClick={() => handleChapterClick(index)} key={index}>{chapter.title}</button>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className='reader_mobile__settings_menu_button'>
                        <button  onClick={openSettings}>
                        <svg width="40px" height="40px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                        <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <g id="System" transform="translate(-1248.000000, -48.000000)">
                                <g id="settings_3_fill" transform="translate(1248.000000, 48.000000)">
                                    <path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z" id="MingCute" fill-rule="nonzero">

                    </path>
                                    <path className='svg_reader_mobile' d="M9.96478,2.80881 C9.59589,2.54328 9.07558,2.4191 8.56387,2.60633 C7.4666,3.0078 6.46004,3.59559 5.5823,4.3308 C5.16522,4.68015 5.01268,5.19204 5.05794,5.64391 C5.13333,6.39671 5.00046,7.12356 4.63874,7.75007 C4.27685,8.37689 3.71344,8.85555 3.02334,9.16664 C2.60859,9.35361 2.24074,9.74273 2.14751,10.2801 C2.05047,10.8396 2,11.4143 2,12.0001 C2,12.5858 2.05047,13.1606 2.14752,13.72 C2.24075,14.2574 2.6086,14.6465 3.02335,14.8335 C3.71344,15.1446 4.27685,15.6233 4.63874,16.2501 C5.00045,16.8766 5.13332,17.6034 5.05794,18.3562 C5.01269,18.8081 5.16523,19.32 5.5823,19.6693 C6.46002,20.4045 7.46655,20.9923 8.56378,21.3937 C9.07552,21.581 9.59585,21.4568 9.96474,21.1912 C10.5794,20.7488 11.2759,20.5 12,20.5 C12.7241,20.5 13.4206,20.7488 14.0353,21.1912 C14.4042,21.4568 14.9245,21.581 15.4362,21.3937 C16.5334,20.9923 17.5399,20.4045 18.4176,19.6694 C18.8347,19.32 18.9872,18.8081 18.942,18.3562 C18.8666,17.6034 18.9994,16.8766 19.3611,16.2501 C19.723,15.6233 20.2865,15.1446 20.9766,14.8335 C21.3914,14.6465 21.7593,14.2574 21.8525,13.72 C21.9495,13.1606 22,12.5858 22,12.0001 C22,11.4144 21.9495,10.8397 21.8525,10.2803 C21.7593,9.74288 21.3914,9.35374 20.9766,9.16678 C20.2865,8.85569 19.723,8.37702 19.3611,7.7502 C18.9994,7.12366 18.8666,6.39677 18.942,5.64392 C18.9873,5.19202 18.8347,4.6801 18.4176,4.33073 C17.5399,3.59556 16.5334,3.00779 15.4361,2.60633 C14.9244,2.41911 14.4041,2.54328 14.0352,2.80881 C13.4206,3.25123 12.7241,3.50003 12,3.50003 C11.2759,3.50003 10.5794,3.25123 9.96478,2.80881 Z M9,12 C9,10.3431 10.3431,9 12,9 C13.6569,9 15,10.3431 15,12 C15,13.6569 13.6569,15 12,15 C10.3431,15 9,13.6569 9,12 Z" id="形状" fill="#000">

                    </path>
                                </g>
                            </g>
                        </g>
                    </svg>
                        </button>
                        {settings && (
                            <div className='reader_mobile__settings_menu' ref={settingsRef}>
                                <select className='reader_mobile__settings_select' onChange={handleStyleChange} value={selectedStyle}>
                                    <option value="style_sepia">Sepia</option>
                                    <option value="style_dark">Dark</option>
                                    <option value="style_lite">Lite</option>
                                </select>
                                <select className='reader_mobile__settings_select' onChange={handleFontChange} value={font}>
                                    <option value="Roboto">Roboto</option>
                                    <option value="Open Sans">Open Sans</option>
                                    <option value="Lato">Lato</option>
                                    <option value="Merriweather">Merriweather</option>
                                    <option value="Georgia">Georgia</option>
                                </select>
                                <div className='reader_mobile__settings_font_size'>
                                    <button className='reader_mobile__settings_font_size_count' onClick={decreaseFontSize}>-</button>
                                    <div className='reader_mobile__settings_font_size_view'>Font Size</div>
                                    <button className='reader_mobile__settings_font_size_count' onClick={increaseFontSize}>+</button>
                                </div>
                                <div className='reader_mobile__settings_line_height'>
                                    <button className='reader_mobile__settings_line_height_count' onClick={decreaseLineHeight}>-</button>
                                    <div className='reader_mobile__settings_line_height_view'>Line Height</div>
                                    <button className='reader_mobile__settings_line_height_count' onClick={increaseLineHeight}>+</button>
                                </div>
                                <select id="text-align-select" className='reader_mobile__settings_select'  value={textAlign} onChange={handleTextAlignChange}>
                                    <option value="left">Left</option>
                                    <option value="center">Center</option>
                                    <option value="right">Right</option>
                                </select>
                                <div className="raeder_mobile__weight_container">
                                    <label htmlFor="fontWeight">Font Wigth</label>
                                    <input 
                                        type="range" 
                                        id="fontWeight" 
                                        min="100" 
                                        max="800" 
                                        step="100" 
                                        value={fontWeight} 
                                        onChange={handleWeightChange} 
                                        className="raeder_mobile__weight_slider"
                                    />
                                    <div className="raeder_mobile__weight_slider_fill" style={{ width: `${((fontWeight - 100) / (800 - 100)) * 100}%` }}></div>
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                    
                </div>
            </header>
            <div className='reader_mobile__content'>
            <div className='reader_mobile__content_container'>
                <div className='reader_mobile_content'ref={contentRef}>
                       <div className='reader_mobile__chapter_text'>{pages[currentPage]?.title}</div>
                    <div className='reader_mobile__text'style={{ fontFamily: font, fontSize: `${fontSize}px`, fontWeight, lineHeight: lineHeight, textAlign: textAlign }}>      {chapters.length > 0 ? (
        <div>
          <h2 className='reader_mobile__chapter_name'>{chapters[currentChapterIndex].title}</h2>
          <div>            {pages.length > 0 && pages.map((page, index) => (
              <div key={index} className='reader_mobile_content_page'>
                {page}
              </div>
            ))}</div>
          <div className='riader_mobile__next_buttons'>
            <button className='riader_mobile__next_button' onClick={handlePreviousChapter} disabled={currentChapterIndex === 0}>
              Back
            </button>
            <button className='riader_mobile__next_button' onClick={handleNextChapter} disabled={currentChapterIndex === chapters.length - 1}>
              Next
            </button>
          </div>
        </div>
      ) : (
        <p></p>
      )}</div>
                </div>
            </div>
            </div>
            </div>
                        )}
        </div>
    )
}


export default MobileReader;