  const Button = ({ children, className = "",...props }) => {
      return (
        <button
          className={"w-full mt-6 bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" + className}
          {...props}
        >
        {children}
      </button>
    );
  }

  export default Button;