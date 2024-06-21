function AppContent() {
    const isAuthenticated = useIsAuthenticated();
    const { accounts } = useMsal();
    const isDevelopment = process.env.NODE_ENV === 'development';
    const userName = isDevelopment ? "kilroy@uark.edu" : accounts?.[0]?.username;

    const location = useLocation();

    const isUseWithNyxPage = location.pathname === "/use-with-nyx";

    return (
        <div className={`App ${!isUseWithNyxPage ? 'file-baby-home' : ''}`}>
            {!isUseWithNyxPage && <HeaderSection />}
            <Routes>
                <Route
                    path="/"
                    element={
                        isAuthenticated || isDevelopment ? (
                            <HomePage isAuthenticated={isAuthenticated} isDevelopment={isDevelopment} userName={userName} />
                        ) : (
                            <SignInButton />
                        )
                    }
                />
                <Route path="/use-with-nyx" element={<UseWithNyxPage userName={userName} />} />
            </Routes>
            {!isUseWithNyxPage && <FooterSection />}
        </div>
    );
}
