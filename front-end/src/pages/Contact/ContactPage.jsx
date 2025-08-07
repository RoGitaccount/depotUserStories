import React, { useState } from 'react';
import { Send, MessageCircle, X, User, Bot, Mail, FileText, Type, Clock, MapPin, Phone, Globe, Heart, Star, Zap } from 'lucide-react';
import ChatBotQueries from './ChatbotQueries'
import TextareaWithLimit from '../../components/PageComponents/textarea';
import * as Yup from 'yup';
import axiosInstance from '../../services/axiosInstance';
import { toast, Bounce } from 'react-toastify';

const ContactPage = () => {
  const chatBot = ChatBotQueries();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Adresse email invalide")
      .required("L'email est requis"),
    subject: Yup.string()
      .min(3, "Le sujet est trop court")
      .required("Le sujet est requis"),
    message: Yup.string()
      .min(10, "Le message est trop court")
      .required("Le message est requis"),
  });


  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: ''
  });

  const [chatMessages, setChatMessages] = useState([
    { 
      id: 1, 
      text: "Bonjour ! 👋 Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?", 
      sender: 'bot', 
      timestamp: new Date() 
    }
  ]);

  const [currentMessage, setCurrentMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Gestion du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validation avec Yup
      await validationSchema.validate(formData, { abortEarly: false });

      // Envoi à l'API
      const res = await axiosInstance.post('/contact/contact', formData);

      if (res.data?.success) {
        setIsFormSubmitted(true);
        setFormData({ email: '', subject: '', message: '' });

        toast.success("Votre message a été envoyé avec succès !", {
          className: "toast-top-position",
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          transition: Bounce,
        });

        setTimeout(() => setIsFormSubmitted(false), 3000);
      }
    } catch (error) {
      if (error.name === 'ValidationError') {
        error.errors.forEach(errMsg => {
          toast.error(errMsg, {
            className: "toast-top-position",
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
            transition: Bounce,
          });
        });
      } else {
        console.error("Erreur d'envoi :", error);
        toast.error("Erreur lors de l'envoi du message.", {
          className: "toast-top-position",
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          transition: Bounce,
        });
      }
    }
  };

  // Gestion du chatbot avec intelligence améliorée
  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      const newUserMessage = {
        id: Date.now(),
        text: currentMessage,
        sender: 'user',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, newUserMessage]);
      setIsTyping(true);

      // Simulation d'une réponse du bot avec délai réaliste
      setTimeout(() => {
        const botResponse = {
          id: Date.now() + 1,
          text: chatBot.generateResponse(currentMessage),
          sender: 'bot',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 1000 + Math.random() * 1000); // Délai variable entre 1-2 secondes

      setCurrentMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Contactez-nous</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 transition-colors duration-300">Nous sommes là pour vous aider</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Formulaire de Contact */}
          <div className="bg-white/90 dark:bg-gray-800 rounded-2xl shadow-xl p-8 h-fit border border-indigo-100 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center mb-6">
              <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3 transition-colors duration-300" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Formulaire de Contact</h2>
            </div>

            {/* {isFormSubmitted && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg transition-colors duration-300">
                <p className="text-green-800 dark:text-green-200 font-medium transition-colors duration-300">✓ Votre message a été envoyé avec succès !</p>
              </div>
            )} */}

            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  <Type className="h-4 w-4 mr-2" />
                  Sujet
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  placeholder="Objet de votre message"
                />
              </div>

              <div>
                <label htmlFor="message" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  <FileText className="h-4 w-4 mr-2" />
                  Message
                </label>
                <TextareaWithLimit
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  maxLength={500}
                  placeholder="Votre message..."
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-indigo-500 dark:to-pink-500 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-pink-600 transition-all duration-200 font-medium flex items-center justify-center"
              >
                <Send className="h-5 w-5 mr-2" />
                Envoyer le message
              </button>
            </div>
          </div>

          {/* Informations de Contact */}
          <div className="space-y-8">
            <div className="bg-white/90 dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-indigo-100 dark:border-gray-700 transition-colors duration-300">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Informations de Contact</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-4 transition-colors duration-300">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Email</p>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">contact@exemple.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mr-4 transition-colors duration-300">
                    <Phone className="h-5 w-5 text-green-600 dark:text-green-400 transition-colors duration-300" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Téléphone</p>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">+33 1 23 45 67 89</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mr-4 transition-colors duration-300">
                    <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Chat en direct</p>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Disponible 24h/24</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mr-4 transition-colors duration-300">
                    <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400 transition-colors duration-300" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Adresse</p>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">123 Rue de la Paix, 75001 Paris</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-indigo-100 dark:border-gray-700 transition-colors duration-300">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Horaires d'ouverture</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Lundi - Vendredi</span>
                  <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">9h00 - 18h00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Samedi</span>
                  <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">10h00 - 16h00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Dimanche</span>
                  <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Fermé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Chatbot */}
      <div className="fixed bottom-4 right-4 z-50">
        {isChatOpen ? (
          <div className="bg-white/90 dark:bg-gray-800 rounded-2xl shadow-2xl w-80 h-96 flex flex-col border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            {/* Header du chat */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-indigo-500 dark:to-pink-500 text-white p-4 rounded-t-2xl flex justify-between items-center transition-colors duration-300">
              <div className="flex items-center">
                <Bot className="h-5 w-5 mr-2" />
                <span className="font-medium">Assistant virtuel</span>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg flex items-start space-x-2 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 dark:bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    } transition-colors duration-300`}
                  >
                    {message.sender === 'bot' && (
                      <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    {message.sender === 'user' && (
                      <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="text-sm whitespace-pre-line">{message.text}</div>
                  </div>
                </div>
              ))}
              
              {/* Indicateur de frappe */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-300">
                    <Bot className="h-4 w-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  disabled={isTyping}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50 transition-colors duration-300"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isTyping || !currentMessage.trim()}
                  className="bg-blue-600 dark:bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-indigo-500 dark:to-pink-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ContactPage;