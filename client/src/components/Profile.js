function Profile() {
    const user = JSON.parse(localStorage.getItem('user'));
    return (
        <>
            
            <div className="container">
                <h1>Welcome! {user?.name}</h1>
                <div className="row">
                    <div className="col-4">
                        <div className="card p-3 mt-2">
                            <h2>Profile</h2>
                            <div className="d-flex justify-content-between mb-0">                          
                                <h5 className="text-muted">User Name</h5>
                                <h5>{user?.name}</h5>
                            </div>
                            <div className="d-flex justify-content-between mb-0">                          
                                <h5 className="text-muted">Mail Id</h5>
                                <h5>{user?.email}</h5>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>

        // <p>This is the Profile Page</p>
    )
}

export default Profile;