import React, { useEffect, useState } from "react";
import { auth } from "../utils/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { addUsers, removeUsers } from "../utils/userSlice";
import { useDispatch } from "react-redux";
import { toggleGptSearchView } from "../utils/gptSlice";
import { SUPPORTED_LANGUAGES } from "../utils/constants";
import { changeLanguage } from "../utils/configSlice";
import { togglePopover } from "../utils/signoutSlice";
import { IoSearch } from "react-icons/io5";
import { FaUser } from "react-icons/fa";

const Header = () => {
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const showGptSearch = useSelector((store) => store.gpt.showGptSearch);
  const popoverBox = useSelector((store) => store.signout.popoverBox);
  const [headerBackground, setHeaderBackground] = useState(false);

  const changeBackground = () => {
    if (window.scrollY >= 80) {
      setHeaderBackground(true);
    } else {
      setHeaderBackground(false);
    }
  };

  window.addEventListener("scroll", changeBackground);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {})
      .catch((error) => {
        navigate("/error");
      });
    dispatch(togglePopover(false));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid, email, displayName, photoURL } = user;
        dispatch(
          addUsers({
            uid: uid,
            email: email,
            displayName: displayName,
            photoURL: photoURL,
          })
        );
        navigate("/browse");
      } else {
        dispatch(removeUsers());
        navigate("/");
      }
    });

    // Unsubscribe when component unmounts
    return () => unsubscribe();
  }, []);

  const handleGptSearchClick = () => {
    // Toggle GPT Search
    dispatch(toggleGptSearchView());
  };

  const handleLanguageChange = (e) => {
    // console.log(e.target.value);
    dispatch(changeLanguage(e.target.value));
  };

  const popOverChange = () => {
    dispatch(togglePopover());
  };

  return (
    <div
      className={`${
        headerBackground ? "header-active" : "bg-none"
      } w-full fixed top-0 z-50 p-4 lg:p-0`}
    >
      <div className="mx-auto max-w-[1440px] sm:py-6 py-3 flex items-center justify-between">
        <Link to="/browse">
          <p className="text-[24px] logo md:text-3xl text-red-700 font-bold">
            NextflixGPT
          </p>
        </Link>

        <div className="flex gap-4">
          {showGptSearch && (
            <select
              className="p-1 text-[12px] hidden md:flex md:p-2 md:text-[14px] bg-white text-black"
              onChange={handleLanguageChange}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.identifier} value={lang.identifier}>
                  {lang.name}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={handleGptSearchClick}
            className="w-24 md:w-28 h-10 md:h-12 bg-red-600 rounded text-white cursor-pointer"
          >
            <p className="text-[15px] lg:text-lg">
              {showGptSearch ? (
                "Homepage"
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <IoSearch /> <p>search</p>
                </div>
              )}
            </p>
          </button>
          <div className="relative">
            {user && (
              <img
                src="https://i.pinimg.com/564x/5b/50/e7/5b50e75d07c726d36f397f6359098f58.jpg"
                // src={user.photoURL}
                alt="usericon"
                onClick={popOverChange}
                className="cursor-pointer w-8 h-8 lg:w-12 lg:h-12 rounded-full object-cover p-[1px] shadow-xl bg-white"
              />
            )}
            {popoverBox && (
              <div className="gap-2 flex flex-col absolute cursor-pointer font-bold text-white/90 py-8 px-8 w-52 shadow-2xl h-28 mr-2 bg-[#333030] rounded-md top-0 -left-52">
                <div className="w-full flex items-center justify-between">
                  <FaUser />
                  <p>nwin</p>
                </div>
                <div className="border-b-[1px] border-[#757575]"></div>

                <button onClick={handleSignOut} className="">
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
