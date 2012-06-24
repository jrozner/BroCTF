class TeamsController < ApplicationController
  def index
    @teams = Team.all

    respond_to do |format|
      format.html
    end
  end

  def new
    @team = Team.new

    respond_to do |format|
      format.html
    end
  end

  def create
    @team = Team.new(params[:team])

    respond_to do |format|
      if @team.save
        flash[:notice] = 'Thank you for pre-registering for BroCTF. Please remember the contact email address used as this will be used to verify identity at DEFCON. See you in Vegas!'
        format.html { redirect_to teams_path }
      else
        format.html { render action: "new" }
      end
    end
  end
end
