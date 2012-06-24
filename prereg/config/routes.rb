Prereg::Application.routes.draw do
  resources :teams, only: [:index, :new, :create]
end
