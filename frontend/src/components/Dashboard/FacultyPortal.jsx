import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Logout from '../User/Logout';
import UserProfile from './SubComponents/UserProfile';
import LoadingSpinner from './SubComponents/LoadingSpinner';
import QuizzesTable from './SubComponents/QuizzesTable';
import DeleteConfirmation from './SubComponents/DeleteConfirmation';
import '../../Template/Toast.css';

const FacultyPortal = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [batch, setBatch] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [userQuizzes, setUserQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('');
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedInAndFetchDetails = async () => {
      try {
        const userDetailsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/users/user-details`, { withCredentials: true });

        if(userDetailsResponse.data.data.role !== 'Faculty') {
          navigate('/login');
        }

        setEmail(userDetailsResponse.data.data.email);
        setName(userDetailsResponse.data.data.name);
        setRole(userDetailsResponse.data.data.role);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate('/login');
        } else {
          toast.error(error.response?.data?.message || 'Error fetching user details');
        }
      } finally {
        setLoading(false);
      }
    };

    checkLoggedInAndFetchDetails();
  }, [navigate]);

  useEffect(() => {
    if (batch) {
      handleFetchQuizzesByBatch();
    }
  }, [batch]);

  const handleFetchQuizzesByBatch = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/quizzes/batch`, { withCredentials: true, params: { batch } });
      const now = new Date();
      const quizzes = response.data.data.filter(quiz => new Date(quiz.endTime) >= now).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setQuizzes(quizzes);
      setViewType('batch');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching quizzes');
    }
  };

  const handleFetchUserQuizzes = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/quizzes/user`, { withCredentials: true });
      const now = new Date();
      const quizzes = response.data.data.filter(quiz => new Date(quiz.endTime) >= now);
      setUserQuizzes(quizzes);
      setViewType('user');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching user quizzes');
    }
  };

  const handleBatchChange = (e) => {
    setBatch(e.target.value);
  };

  const handleDeleteQuiz = (quizId) => {
    setQuizToDelete(quizId);
    setIsDeletePopupOpen(true);
  };

  const confirmDeleteQuiz = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/quizzes/delete/${quizToDelete}`, { withCredentials: true });
      setUserQuizzes(userQuizzes.filter(quiz => quiz._id !== quizToDelete));
      setIsDeletePopupOpen(false);
      setQuizToDelete(null);
      toast.success('Quiz deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting quiz');
      setIsDeletePopupOpen(false);
      setQuizToDelete(null);
    }
  };

  const cancelDeleteQuiz = () => {
    setIsDeletePopupOpen(false);
    setQuizToDelete(null);
  };

  const handleNavigateToScheduleQuiz = () => {
    navigate('/schedule-quiz');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="font-Poppins flex flex-col h-[90vh] w-full bg-dashBoardBg p-4 sm:p-6 mx-2 sm:mx-3 my-5 sm:my-7 rounded-lg select-none">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="flex flex-col sm:flex-row mb-6 items-center justify-between">
        <h1 className="text-2xl sm:text-3xl border-b-4 border-l-4 pl-3 pb-2 pt-1 border-red-500 shadow-sm rounded-sm font-semibold text-center text-gray-800 mb-4 sm:mb-2">
          Dashboard
        </h1>
        <div className="flex items-center gap-6 sm:gap-8">
          <UserProfile name={name} email={email} role={role} />
          <Logout />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-300 flex-1">
        <div className="flex flex-col sm:flex-row gap-2 mb-8 sm:mb-16">
          <button
            onClick={handleFetchUserQuizzes}
            className="flex-1 border-red-500 text-white border-[2.5px] bg-red-500 px-3 font-semibold py-2 rounded-md hover:bg-white hover:text-red-500 transition-colors"
          >
            View Your Scheduled Quizzes
          </button>
          <button
            onClick={() => {
              setViewType('batch');
              setBatch('');
              setUserQuizzes([]);
            }}
            className="flex-1 border-red-500 text-white border-[2.5px] bg-red-500 px-3 font-semibold py-2 rounded-md hover:bg-white hover:text-red-500 transition-colors"
          >
            View Quizzes by Batch
          </button>
          <button
            onClick={handleNavigateToScheduleQuiz}
            className="flex-1 border-red-500 text-white border-[2.5px] bg-red-500 px-3 font-semibold py-2 rounded-md hover:bg-white hover:text-red-500 transition-colors"
          >
            Schedule Quiz
          </button>
        </div>
        {!viewType && (
          <p className="text-center text-gray-900 mt-20 sm:mt-36 font-semibold">Select an option above to view quizzes or schedule a new quiz.</p>
        )}
        {viewType === 'batch' && (
          <div className="mx-auto p-4">
            <div className="w-full max-w-sm sm:max-w-md mx-auto">
              <label htmlFor="batch" className="block text-gray-900 font-semibold mb-2 text-center">
                Select Batch
              </label>
              <select
                id="batch"
                value={batch}
                onChange={handleBatchChange}
                className="w-full border border-gray-500 rounded-lg p-2 bg-gray-50 text-gray-900"
              >
                <option value="">Select Batch</option>
                <option value="Y-20">Y-20</option>
                <option value="Y-21">Y-21</option>
                <option value="Y-22">Y-22</option>
                <option value="Y-23">Y-23</option>
                <option value="Y-24">Y-24</option>
              </select>
            </div>
            {batch && <QuizzesTable quizzes={quizzes} viewType={viewType} />}
          </div>
        )}
        {viewType === 'user' && <QuizzesTable quizzes={userQuizzes} viewType={viewType} onDelete={handleDeleteQuiz} />}
      </div>
      <DeleteConfirmation
        isOpen={isDeletePopupOpen}
        onClose={cancelDeleteQuiz}
        onConfirm={confirmDeleteQuiz}
      />
    </div>
  );
};

export default FacultyPortal;
